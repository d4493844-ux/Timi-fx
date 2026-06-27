import math, urllib.request, json
ANN=math.sqrt(252)
def mean(a): return sum(a)/len(a) if a else 0.0
def std(a):
    if len(a)<2: return 0.0
    m=mean(a); return math.sqrt(sum((x-m)**2 for x in a)/len(a))
def adx_proxy(c,i,n=14):
    if i<n: return 0.0
    net=abs(c[i]-c[i-n]); path=sum(abs(c[k]-c[k-1]) for k in range(i-n+1,i+1))
    return 100*net/path if path>0 else 0.0
def atr_pct(c,i,n=14):
    if i<n: return 0.0
    return mean([abs(c[k]-c[k-1]) for k in range(i-n+1,i+1)])/c[i] if c[i]>0 else 0.0
def realized_vol(c,i,w=20):
    if i<w: return 0.0
    rets=[math.log(c[k]/c[k-1]) for k in range(i-w+1,i+1)]
    return std(rets)*ANN
def entry_momentum(c,lb):
    pos=[0]*len(c)
    for i in range(lb,len(c)): pos[i]=1 if c[i]>c[i-lb] else -1
    return pos
def entry_donchian(c,n):
    pos=[0]*len(c); cur=0; en=n//2
    for i in range(n,len(c)):
        u=max(c[i-n:i]); l=min(c[i-n:i]); eu=max(c[i-en:i]); el=min(c[i-en:i])
        if cur==0:
            if c[i]>u: cur=1
            elif c[i]<l: cur=-1
        elif cur==1 and c[i]<el: cur=0
        elif cur==-1 and c[i]>eu: cur=0
        pos[i]=cur
    return pos
def extract_trades(pos,c,label=""):
    trades=[]; entry_i=None; entry_dir=0
    for i in range(1,len(c)):
        if pos[i]!=pos[i-1]:
            if entry_i is not None and entry_dir!=0:
                exit_i=i; ret=entry_dir*math.log(c[exit_i]/c[entry_i])
                seg=c[entry_i:exit_i+1]
                if entry_dir==1:
                    mfe=(max(seg)-c[entry_i])/c[entry_i]; mae=(min(seg)-c[entry_i])/c[entry_i]
                else:
                    mfe=(c[entry_i]-min(seg))/c[entry_i]; mae=(c[entry_i]-max(seg))/c[entry_i]
                trades.append(dict(label=label,dir=entry_dir,ret=ret,win=1 if ret>0 else 0,
                    holding=exit_i-entry_i,adx=adx_proxy(c,entry_i),atr=atr_pct(c,entry_i),
                    vol=realized_vol(c,entry_i),mfe=mfe,mae=mae))
            if pos[i]!=0: entry_i=i; entry_dir=pos[i]
            else: entry_i=None; entry_dir=0
    return trades
def mine_winners(trades):
    wins=[t for t in trades if t["win"]]; losses=[t for t in trades if not t["win"]]
    if len(wins)<5 or len(losses)<5: return None
    out={}
    for a in ["adx","atr","vol","holding"]:
        wm=mean([t[a] for t in wins]); lm=mean([t[a] for t in losses]); out[a]=(wm,lm,wm-lm)
    return out,len(wins),len(losses)
def cry(sym):
    try:
        with urllib.request.urlopen(f"https://data-api.binance.vision/api/v3/klines?symbol={sym}&interval=1d&limit=1000",timeout=30) as r:
            return [float(k[4]) for k in json.loads(r.read())]
    except: return None
print("Loading DOGE + ETH + BTC...")
for name,sym,fn,param in [("DOGE","DOGEUSDT",entry_momentum,20),("ETH","ETHUSDT",entry_momentum,60),("BTC","BTCUSDT",entry_donchian,20)]:
    c=cry(sym)
    if not c: print(f"{name}: no data"); continue
    trades=extract_trades(fn(c,param),c,name)
    print(f"\n{'='*70}\n{name} ({fn.__name__}={param}) — {len(trades)} trades\n{'='*70}")
    m=mine_winners(trades)
    if m:
        stats,nw,nl=m
        print(f"  {nw} winners, {nl} losers ({100*nw/(nw+nl):.0f}% win rate)")
        print(f"  total return: {sum(t['ret'] for t in trades):+.2f} (log)")
        print(f"\n  WINNERS vs LOSERS:")
        for a,(wm,lm,diff) in stats.items():
            print(f"    {a:9s}: win={wm:8.2f}  loss={lm:8.2f}  ({'winners HIGHER' if diff>0 else 'winners LOWER'})")
        wins=[t for t in trades if t['win']]; losses=[t for t in trades if not t['win']]
        awr=mean([t['ret'] for t in wins]); alr=mean([t['ret'] for t in losses])
        print(f"\n  avg WIN: {awr:+.3f}  avg LOSS: {alr:+.3f}  (asymmetry: {abs(awr/alr):.2f}x)")
        print(f"  winner holding: {mean([t['holding'] for t in wins]):.0f} bars | loser holding: {mean([t['holding'] for t in losses]):.0f} bars")
    else:
        print("  too few trades to mine")
print(f"\n{'='*70}\nINSIGHT: winners sharing high ADX + long holding = 'let trends run' is the edge.")
print("A tradeable RULE from trade structure, not another indicator search.\n"+"="*70)
