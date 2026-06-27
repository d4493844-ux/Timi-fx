import math, random, urllib.request, zipfile, io, csv, json
ANN=math.sqrt(252)
def mean(a): return sum(a)/len(a) if a else 0.0
def std(a):
    if len(a)<2: return 0.0
    m=mean(a); return math.sqrt(sum((x-m)**2 for x in a)/len(a))
def sharpe(d):
    if len(d)<5: return 0.0
    s=std(d); return (mean(d)/s)*ANN if s>0 else 0.0
def skew(d):
    n=len(d); m=mean(d); s=std(d)
    return sum((x-m)**3 for x in d)/(n*s**3) if (s>0 and n>2) else 0.0
def kurt(d):
    n=len(d); m=mean(d); s=std(d)
    return sum((x-m)**4 for x in d)/(n*s**4) if (s>0 and n>3) else 3.0
def norm_cdf(x): return 0.5*(1+math.erf(x/math.sqrt(2)))
def ema(p,n):
    k=2/(n+1); e=p[0]; o=[e]
    for x in p[1:]: e=x*k+e*(1-k); o.append(e)
    return o
def rsi_series(c,n=14):
    out=[50.0]*len(c)
    for i in range(n,len(c)):
        g=l=0.0
        for k in range(i-n+1,i+1):
            d=c[k]-c[k-1]
            if d>0:g+=d
            else:l-=d
        out[i]=100-100/(1+g/(l or 1e-10))
    return out
ENTRIES={
 "ema_cross":[{"fast":f,"slow":s} for f,s in [(8,21),(10,50),(20,100),(5,30),(12,26),(50,200)]],
 "momentum":[{"lb":lb} for lb in [10,20,40,60,90,120,200]],
 "trend_vote":[{"lb":lb} for lb in [[5,10,20,60],[10,20,40,80],[21,63,126,252],[3,8,21,55]]],
 "rsi_rev":[{"n":n,"lo":lo,"hi":hi} for n in [7,14,21] for lo,hi in [(30,70),(20,80),(25,75)]],
 "donchian":[{"n":n} for n in [20,30,40,55,80]],
 "breakout":[{"n":n} for n in [10,20,30,50]],
}
FILTERS={"none":[{}],"vol_low":[{"pct":p} for p in [0.5,0.7]],"vol_high":[{"pct":p} for p in [0.3,0.5]]}
SIZINGS={"fixed":[{}],"vol_target":[{"vt":vt} for vt in [0.15,0.25,0.40]]}
def entry_signal(kind,params,c):
    n=len(c); pos=[0]*n
    if kind=="ema_cross":
        ef=ema(c,params["fast"]); es=ema(c,params["slow"]); s=params["slow"]
        for i in range(s,n): pos[i]=1 if ef[i]>es[i] else -1
    elif kind=="momentum":
        lb=params["lb"]
        for i in range(lb,n): pos[i]=1 if c[i]>c[i-lb] else -1
    elif kind=="trend_vote":
        lb=params["lb"]; m=max(lb)
        for i in range(m,n):
            v=sum(1 if c[i]>c[i-l] else -1 for l in lb); pos[i]=1 if v>0 else -1 if v<0 else 0
    elif kind=="rsi_rev":
        r=rsi_series(c,params["n"]); lo=params["lo"]; hi=params["hi"]
        for i in range(params["n"],n):
            if r[i]<lo: pos[i]=1
            elif r[i]>hi: pos[i]=-1
            else: pos[i]=pos[i-1]
    elif kind=="donchian":
        nn=params["n"]; cur=0; en=nn//2
        for i in range(nn,n):
            u=max(c[i-nn:i]); l=min(c[i-nn:i]); eu=max(c[i-en:i]); el=min(c[i-en:i])
            if cur==0:
                if c[i]>u: cur=1
                elif c[i]<l: cur=-1
            elif cur==1 and c[i]<el: cur=0
            elif cur==-1 and c[i]>eu: cur=0
            pos[i]=cur
    elif kind=="breakout":
        nn=params["n"]
        for i in range(nn,n):
            hi=max(c[i-nn:i]); lo=min(c[i-nn:i])
            if c[i]>hi: pos[i]=1
            elif c[i]<lo: pos[i]=-1
            else: pos[i]=pos[i-1]
    return pos
def filter_mask(kind,params,c):
    n=len(c); mask=[1]*n
    if kind=="none": return mask
    rets=[0.0]+[math.log(c[k]/c[k-1]) for k in range(1,n)]
    win=30; vols=[0.0]*n
    for i in range(win,n): vols[i]=std(rets[i-win:i])
    sv=sorted(v for v in vols if v>0)
    if sv:
        thr=sv[int(params["pct"]*len(sv))-1]
        for i in range(n):
            if kind=="vol_low": mask[i]=1 if 0<vols[i]<=thr else 0
            else: mask[i]=1 if vols[i]>=thr else 0
    return mask
def genome_returns(g,c,cost_bps=4):
    raw=entry_signal(g["entry"][0],g["entry"][1],c)
    mask=filter_mask(g["filter"][0],g["filter"][1],c)
    rets=[0.0]+[math.log(c[k]/c[k-1]) for k in range(1,len(c))]
    out=[]; prev=0.0
    for i in range(len(c)-1):
        p=raw[i]*mask[i]; size=1.0
        if g["sizing"][0]=="vol_target":
            seg=rets[max(0,i-30):i]; rv=std(seg)*ANN if len(seg)>=5 else 0
            size=min(3.0,g["sizing"][1]["vt"]/rv) if rv>0 else 0
        eff=p*size; ch=abs(eff-prev); prev=eff
        out.append(eff*rets[i+1]-cost_bps/10000*ch)
    return out
def total_genome_size():
    e=sum(len(v) for v in ENTRIES.values()); f=sum(len(v) for v in FILTERS.values()); s=sum(len(v) for v in SIZINGS.values())
    return e*f*s
def sample_genomes(n,seed=1):
    rng=random.Random(seed)
    eo=[(k,p) for k,ps in ENTRIES.items() for p in ps]
    fo=[(k,p) for k,ps in FILTERS.items() for p in ps]
    so=[(k,p) for k,ps in SIZINGS.items() for p in ps]
    return [{"entry":rng.choice(eo),"filter":rng.choice(fo),"sizing":rng.choice(so)} for _ in range(n)]
def deflated_sharpe(rets,n_trials):
    n=len(rets)
    if n<20: return 0.0,0.0
    sr=sharpe(rets)/ANN; g3=skew(rets); g4=kurt(rets); emc=0.5772156649
    e_max=(math.sqrt(2*math.log(n_trials))-emc/math.sqrt(2*math.log(n_trials))) if n_trials>1 else 0
    sr0=e_max/math.sqrt(n); var=(1-g3*sr+((g4-1)/4)*sr**2)/(n-1)
    if var<=0: return 0.0,sr0*ANN
    return norm_cdf((sr-sr0)/math.sqrt(var)),sr0*ANN
print("Loading real data...")
with urllib.request.urlopen("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip",timeout=60) as r:
    z=zipfile.ZipFile(io.BytesIO(r.read()))
rows=list(csv.reader(io.StringIO(z.read(z.namelist()[0]).decode()))); ccys=rows[0][1:]; data={}
for row in rows[1:]:
    if not row or not row[0]: continue
    rec={}
    for k,ccy in enumerate(ccys):
        if k+1<len(row):
            v=row[k+1].strip()
            if v and v!="N/A":
                try: rec[ccy]=float(v)
                except: pass
    data[row[0]]=rec
dates=sorted(data.keys())
def uv(rec,ccy):
    if ccy=="USD": return 1.0
    if ccy=="EUR": return rec.get("USD")
    eu,ec=rec.get("USD"),rec.get(ccy); return eu/ec if (eu and ec) else None
def fx(b,q): return [uv(data[d],b)/uv(data[d],q) for d in dates if uv(data[d],b) and uv(data[d],q) and uv(data[d],q)!=0]
def cry(sym):
    try:
        with urllib.request.urlopen(f"https://data-api.binance.vision/api/v3/klines?symbol={sym}&interval=1d&limit=1000",timeout=30) as r:
            return [float(k[4]) for k in json.loads(r.read())]
    except: return None
assets={}
for p in ["EURUSD","GBPUSD","USDJPY","AUDUSD","GBPJPY"]:
    c=fx(p[:3],p[3:])
    if len(c)>400: assets[p]=c
for s in ["BTCUSDT","DOGEUSDT","LINKUSDT","ETHUSDT"]:
    c=cry(s)
    if c and len(c)>400: assets[s.replace("USDT","")]=c
total=total_genome_size(); N=150
print(f"Genome space: {total:,} strategies. Sampling {N}/asset, DSR corrected for FULL space.\n")
print(f"{'asset':9s} {'bestSharpe':>10s} {'DSR':>6s} {'bar':>6s} genome")
print("-"*88)
allr=[]
for aname,c in assets.items():
    best=None
    for g in sample_genomes(N,seed=hash(aname)%1000):
        r=genome_returns(g,c)
        if len(r)<200: continue
        dsr,bar=deflated_sharpe(r,total); sh=sharpe(r)
        allr.append((dsr,sh,aname,g))
        if best is None or sh>best[1]: best=(dsr,sh,bar,g)
    if best:
        print(f"{aname:9s} {best[1]:>+10.2f} {best[0]:>6.2f} {best[2]:>+6.2f} {best[3]['entry'][0]}+{best[3]['filter'][0]}+{best[3]['sizing'][0]}")
surv=[x for x in allr if x[0]>0.90]
print("-"*88)
print(f"\nBeating FULL-space deflated bar (DSR>0.90): {len(surv)}/{len(allr)} tested")
if surv:
    surv.sort(reverse=True)
    for dsr,sh,a,g in surv[:10]:
        print(f"  {a:8s} Sharpe={sh:+.2f} DSR={dsr:.3f} {g['entry'][0]}+{g['filter'][0]}+{g['sizing'][0]}")
else:
    print(f"  NONE. Honestly correcting for {total:,} strategies, nothing clears the bar.")
