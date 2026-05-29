
// ── ML Model: BOOM1000 ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: 120, Meta trees: 300
function predict_BOOMk(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[1] <= -5.509066) {
        if (f[16] <= 0.591957) {
          if (f[18] <= 0.158333) {
            return 0.050883;
          } else {
            return 0.126630;
          }
        } else {
          return -0.003363;
        }
      } else {
        if (f[16] <= 0.426675) {
          if (f[5] <= 0.002645) {
            if (f[7] <= -0.887853) {
              if (f[8] <= -0.000642) {
                if (f[19] <= 0.002583) {
                  return -0.051169;
                } else {
                  return 0.054266;
                }
              } else {
                if (f[5] <= -0.000588) {
                  return -0.042292;
                } else {
                  return 0.016269;
                }
              }
            } else {
              return -0.160000;
            }
          } else {
            return 0.095871;
          }
        } else {
          if (f[7] <= -0.976925) {
            if (f[6] <= 0.000047) {
              if (f[9] <= 0.491075) {
                if (f[1] <= -5.317949) {
                  return 0.057847;
                } else {
                  return 0.123347;
                }
              } else {
                if (f[5] <= -0.000568) {
                  return -0.071325;
                } else {
                  return 0.085227;
                }
              }
            } else {
              if (f[18] <= 0.055000) {
                return 0.031807;
              } else {
                if (f[6] <= 0.000129) {
                  return -0.160000;
                } else {
                  return -0.105307;
                }
              }
            }
          } else {
            if (f[9] <= 0.483974) {
              if (f[1] <= -4.527007) {
                if (f[9] <= 0.474093) {
                  return 0.039078;
                } else {
                  return -0.096942;
                }
              } else {
                if (f[17] <= 0.686015) {
                  return -0.100956;
                } else {
                  return 0.070536;
                }
              }
            } else {
              if (f[19] <= 0.002585) {
                if (f[9] <= 0.534610) {
                  return -0.153895;
                } else {
                  return -0.051169;
                }
              } else {
                return -0.025882;
              }
            }
          }
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[1] <= -5.497707) {
          if (f[16] <= 0.591957) {
            if (f[18] <= 0.158333) {
              return 0.023472;
            } else {
              return 0.108521;
            }
          } else {
            return -0.034434;
          }
        } else {
          if (f[16] <= 0.431145) {
            if (f[15] <= -0.000011) {
              if (f[18] <= 0.015000) {
                if (f[15] <= -0.000013) {
                  return 0.008991;
                } else {
                  return -0.101375;
                }
              } else {
                if (f[17] <= 0.498311) {
                  return 0.001344;
                } else {
                  return -0.157319;
                }
              }
            } else {
              if (f[9] <= 0.489328) {
                if (f[9] <= 0.464974) {
                  return -0.102437;
                } else {
                  return 0.062557;
                }
              } else {
                if (f[9] <= 0.497525) {
                  return -0.105407;
                } else {
                  return -0.004926;
                }
              }
            }
          } else {
            if (f[9] <= 0.469588) {
              if (f[2] <= 0.001391) {
                if (f[3] <= 0.000070) {
                  return -0.157184;
                } else {
                  return -0.099732;
                }
              } else {
                if (f[9] <= 0.467168) {
                  return -0.011380;
                } else {
                  return 0.101841;
                }
              }
            } else {
              if (f[5] <= -0.000586) {
                if (f[17] <= 0.629201) {
                  return -0.136904;
                } else {
                  return -0.016121;
                }
              } else {
                if (f[16] <= 0.528085) {
                  return -0.083964;
                } else {
                  return 0.060845;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000083) {
          if (f[15] <= 0.000010) {
            return 0.152135;
          } else {
            return 0.157871;
          }
        } else {
          if (f[16] <= 0.434046) {
            if (f[15] <= 0.000018) {
              if (f[5] <= 0.000681) {
                if (f[5] <= 0.000327) {
                  return -0.014432;
                } else {
                  return -0.161056;
                }
              } else {
                if (f[16] <= 0.340477) {
                  return 0.068594;
                } else {
                  return -0.016816;
                }
              }
            } else {
              if (f[8] <= 0.000410) {
                return 0.129414;
              } else {
                if (f[1] <= 4.783048) {
                  return -0.015801;
                } else {
                  return 0.105505;
                }
              }
            }
          } else {
            if (f[3] <= 0.000235) {
              if (f[18] <= 0.021667) {
                return -0.154943;
              } else {
                return -0.096699;
              }
            } else {
              return -0.007427;
            }
          }
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[16] <= 0.225070) {
          if (f[9] <= 0.524142) {
            if (f[4] <= -0.000270) {
              if (f[4] <= -0.000293) {
                if (f[5] <= 0.000588) {
                  return 0.009846;
                } else {
                  return 0.105610;
                }
              } else {
                return 0.088685;
              }
            } else {
              return -0.041672;
            }
          } else {
            if (f[9] <= 0.537323) {
              return -0.121889;
            } else {
              return 0.002862;
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[8] <= -0.000645) {
              if (f[16] <= 0.531217) {
                if (f[4] <= -0.000286) {
                  return -0.012966;
                } else {
                  return 0.086551;
                }
              } else {
                return -0.126100;
              }
            } else {
              if (f[5] <= -0.000598) {
                if (f[17] <= 0.459147) {
                  return -0.023985;
                } else {
                  return -0.130737;
                }
              } else {
                if (f[14] <= -0.000167) {
                  return -0.063374;
                } else {
                  return 0.005771;
                }
              }
            }
          } else {
            if (f[17] <= 0.584266) {
              if (f[8] <= -0.000660) {
                if (f[16] <= 0.550129) {
                  return -0.011217;
                } else {
                  return 0.104003;
                }
              } else {
                if (f[5] <= -0.000604) {
                  return -0.154048;
                } else {
                  return -0.018723;
                }
              }
            } else {
              if (f[16] <= 0.431145) {
                if (f[16] <= 0.413325) {
                  return 0.050561;
                } else {
                  return 0.123500;
                }
              } else {
                if (f[16] <= 0.553354) {
                  return -0.059336;
                } else {
                  return 0.072736;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000083) {
          return 0.144965;
        } else {
          if (f[16] <= 0.421003) {
            if (f[15] <= 0.000018) {
              if (f[5] <= 0.001053) {
                if (f[8] <= 0.000421) {
                  return -0.018984;
                } else {
                  return -0.120997;
                }
              } else {
                return 0.055450;
              }
            } else {
              if (f[14] <= 0.000586) {
                return 0.136752;
              } else {
                if (f[15] <= 0.000037) {
                  return 0.031550;
                } else {
                  return 0.101311;
                }
              }
            }
          } else {
            if (f[16] <= 0.502981) {
              if (f[0] <= 76.794323) {
                return -0.088684;
              } else {
                return 0.049682;
              }
            } else {
              return -0.149321;
            }
          }
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[1] <= -5.497707) {
          if (f[19] <= 0.002582) {
            return 0.107883;
          } else {
            if (f[2] <= 0.001464) {
              if (f[18] <= 0.221667) {
                if (f[9] <= 0.478934) {
                  return 0.002067;
                } else {
                  return -0.131761;
                }
              } else {
                return 0.078151;
              }
            } else {
              return 0.099199;
            }
          }
        } else {
          if (f[1] <= -5.077795) {
            if (f[6] <= 0.000017) {
              if (f[5] <= -0.000586) {
                if (f[9] <= 0.479467) {
                  return -0.009662;
                } else {
                  return -0.142181;
                }
              } else {
                if (f[15] <= 0.000000) {
                  return -0.044801;
                } else {
                  return 0.089281;
                }
              }
            } else {
              if (f[14] <= -0.000188) {
                return -0.070153;
              } else {
                if (f[9] <= 0.477894) {
                  return -0.154791;
                } else {
                  return -0.144750;
                }
              }
            }
          } else {
            if (f[1] <= -4.732390) {
              if (f[9] <= 0.474954) {
                return 0.114776;
              } else {
                if (f[19] <= 0.002582) {
                  return 0.117690;
                } else {
                  return -0.027988;
                }
              }
            } else {
              if (f[1] <= -3.097948) {
                if (f[15] <= 0.000000) {
                  return -0.083065;
                } else {
                  return -0.005972;
                }
              } else {
                if (f[15] <= -0.000005) {
                  return -0.032230;
                } else {
                  return 0.014280;
                }
              }
            }
          }
        }
      } else {
        if (f[14] <= -0.000143) {
          if (f[19] <= 0.002608) {
            if (f[5] <= 0.000037) {
              if (f[18] <= 0.061667) {
                return 0.139230;
              } else {
                return 0.134490;
              }
            } else {
              return 0.095514;
            }
          } else {
            if (f[2] <= 0.003006) {
              return -0.008723;
            } else {
              return 0.073562;
            }
          }
        } else {
          if (f[6] <= 0.000161) {
            return -0.087912;
          } else {
            if (f[6] <= 0.000671) {
              if (f[1] <= -0.525580) {
                if (f[9] <= 0.502414) {
                  return 0.088158;
                } else {
                  return 0.026969;
                }
              } else {
                if (f[9] <= 0.533053) {
                  return -0.040739;
                } else {
                  return 0.061095;
                }
              }
            } else {
              return 0.108736;
            }
          }
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[16] <= 0.225070) {
          if (f[9] <= 0.524142) {
            if (f[4] <= -0.000270) {
              if (f[4] <= -0.000293) {
                if (f[5] <= 0.000588) {
                  return 0.008095;
                } else {
                  return 0.098855;
                }
              } else {
                return 0.081402;
              }
            } else {
              return -0.039217;
            }
          } else {
            if (f[6] <= 0.000286) {
              if (f[0] <= 55.614092) {
                return -0.085731;
              } else {
                return 0.087454;
              }
            } else {
              return -0.149758;
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[2] <= 0.001278) {
              if (f[19] <= 0.002583) {
                if (f[4] <= -0.000301) {
                  return -0.106314;
                } else {
                  return 0.008355;
                }
              } else {
                if (f[4] <= -0.000306) {
                  return -0.071232;
                } else {
                  return -0.149723;
                }
              }
            } else {
              if (f[2] <= 0.001439) {
                if (f[16] <= 0.461348) {
                  return 0.024035;
                } else {
                  return -0.044589;
                }
              } else {
                if (f[5] <= -0.000607) {
                  return -0.116606;
                } else {
                  return -0.034373;
                }
              }
            }
          } else {
            if (f[16] <= 0.431145) {
              if (f[17] <= 0.586190) {
                if (f[3] <= 0.000061) {
                  return -0.054558;
                } else {
                  return 0.029996;
                }
              } else {
                return 0.071962;
              }
            } else {
              if (f[6] <= 0.000015) {
                if (f[15] <= 0.000000) {
                  return 0.030615;
                } else {
                  return -0.063772;
                }
              } else {
                if (f[16] <= 0.550129) {
                  return -0.089335;
                } else {
                  return 0.083464;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000083) {
          return 0.129321;
        } else {
          if (f[16] <= 0.421003) {
            if (f[15] <= 0.000018) {
              if (f[5] <= 0.000681) {
                if (f[5] <= 0.000327) {
                  return -0.009877;
                } else {
                  return -0.147485;
                }
              } else {
                if (f[9] <= 0.507877) {
                  return -0.087001;
                } else {
                  return 0.068137;
                }
              }
            } else {
              return 0.062966;
            }
          } else {
            if (f[16] <= 0.502981) {
              if (f[0] <= 76.794323) {
                return -0.082507;
              } else {
                return 0.045116;
              }
            } else {
              return -0.138280;
            }
          }
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[1] <= -5.497707) {
          if (f[16] <= 0.591957) {
            if (f[19] <= 0.002582) {
              return 0.119431;
            } else {
              if (f[8] <= -0.000662) {
                return 0.097443;
              } else {
                return -0.018476;
              }
            }
          } else {
            return -0.036201;
          }
        } else {
          if (f[16] <= 0.431145) {
            if (f[15] <= -0.000010) {
              if (f[17] <= 0.508502) {
                if (f[1] <= 6.128071) {
                  return -0.029451;
                } else {
                  return 0.084203;
                }
              } else {
                if (f[8] <= 0.000942) {
                  return -0.107677;
                } else {
                  return 0.006622;
                }
              }
            } else {
              if (f[9] <= 0.489328) {
                if (f[9] <= 0.464974) {
                  return -0.082020;
                } else {
                  return 0.059703;
                }
              } else {
                if (f[9] <= 0.494820) {
                  return -0.112722;
                } else {
                  return -0.002372;
                }
              }
            }
          } else {
            if (f[9] <= 0.487845) {
              if (f[6] <= 0.000046) {
                if (f[1] <= -5.077795) {
                  return -0.026985;
                } else {
                  return 0.091767;
                }
              } else {
                if (f[16] <= 0.482922) {
                  return -0.015040;
                } else {
                  return -0.096204;
                }
              }
            } else {
              if (f[3] <= 0.000059) {
                if (f[8] <= -0.000630) {
                  return -0.084770;
                } else {
                  return 0.027573;
                }
              } else {
                if (f[5] <= -0.000606) {
                  return -0.128258;
                } else {
                  return -0.134241;
                }
              }
            }
          }
        }
      } else {
        if (f[14] <= -0.000143) {
          if (f[8] <= -0.000074) {
            if (f[8] <= -0.000636) {
              return 0.121350;
            } else {
              return 0.125937;
            }
          } else {
            if (f[15] <= 0.000010) {
              if (f[1] <= 4.905222) {
                return -0.012299;
              } else {
                return 0.063303;
              }
            } else {
              return 0.092310;
            }
          }
        } else {
          if (f[6] <= 0.000161) {
            return -0.080081;
          } else {
            if (f[16] <= 0.451402) {
              if (f[6] <= 0.000671) {
                if (f[1] <= -0.525580) {
                  return 0.060721;
                } else {
                  return -0.004020;
                }
              } else {
                return 0.105478;
              }
            } else {
              if (f[6] <= 0.000491) {
                return -0.096300;
              } else {
                return 0.003753;
              }
            }
          }
        }
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[14] <= -0.000168) {
          if (f[17] <= 0.718743) {
            if (f[12] <= 8.048202) {
              if (f[19] <= 0.002582) {
                return 0.012818;
              } else {
                if (f[6] <= 0.000004) {
                  return -0.090584;
                } else {
                  return -0.148507;
                }
              }
            } else {
              if (f[6] <= 0.000004) {
                return 0.104863;
              } else {
                if (f[18] <= 0.228333) {
                  return -0.025726;
                } else {
                  return 0.060716;
                }
              }
            }
          } else {
            if (f[15] <= -0.000000) {
              return 0.012672;
            } else {
              return 0.087705;
            }
          }
        } else {
          if (f[17] <= 0.470294) {
            if (f[9] <= 0.483521) {
              return 0.116038;
            } else {
              return 0.029023;
            }
          } else {
            if (f[14] <= -0.000167) {
              if (f[9] <= 0.502920) {
                return 0.009966;
              } else {
                return 0.105466;
              }
            } else {
              if (f[18] <= 0.111667) {
                if (f[5] <= 0.000719) {
                  return -0.056077;
                } else {
                  return 0.045493;
                }
              } else {
                return 0.043986;
              }
            }
          }
        }
      } else {
        if (f[14] <= -0.000143) {
          if (f[19] <= 0.002608) {
            if (f[15] <= 0.000009) {
              return 0.083622;
            } else {
              if (f[14] <= -0.000176) {
                return 0.117095;
              } else {
                return 0.121690;
              }
            }
          } else {
            if (f[14] <= -0.000184) {
              return -0.017741;
            } else {
              return 0.058320;
            }
          }
        } else {
          if (f[6] <= 0.000178) {
            if (f[15] <= 0.000008) {
              return 0.002634;
            } else {
              return -0.123534;
            }
          } else {
            if (f[6] <= 0.000671) {
              if (f[6] <= 0.000327) {
                if (f[17] <= 0.446062) {
                  return -0.158666;
                } else {
                  return 0.059397;
                }
              } else {
                if (f[10] <= 0.502588) {
                  return -0.055790;
                } else {
                  return 0.059076;
                }
              }
            } else {
              return 0.091904;
            }
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[15] <= 0.000001) {
        if (f[1] <= -5.497707) {
          if (f[19] <= 0.002582) {
            return 0.091527;
          } else {
            if (f[8] <= -0.000659) {
              return 0.051065;
            } else {
              if (f[1] <= -5.526992) {
                return -0.116862;
              } else {
                return 0.027583;
              }
            }
          }
        } else {
          if (f[1] <= -5.077795) {
            if (f[2] <= 0.001414) {
              if (f[9] <= 0.489328) {
                return 0.036052;
              } else {
                if (f[14] <= -0.000172) {
                  return -0.117798;
                } else {
                  return 0.001599;
                }
              }
            } else {
              if (f[8] <= -0.000667) {
                return -0.050555;
              } else {
                if (f[9] <= 0.469588) {
                  return -0.147694;
                } else {
                  return -0.129596;
                }
              }
            }
          } else {
            if (f[1] <= -4.732390) {
              if (f[9] <= 0.474954) {
                return 0.115668;
              } else {
                if (f[19] <= 0.002582) {
                  return 0.112853;
                } else {
                  return -0.024118;
                }
              }
            } else {
              if (f[6] <= 0.000135) {
                if (f[15] <= 0.000000) {
                  return -0.074773;
                } else {
                  return 0.005086;
                }
              } else {
                if (f[15] <= -0.000011) {
                  return -0.046423;
                } else {
                  return -0.000318;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000149) {
          if (f[15] <= 0.000006) {
            return 0.086289;
          } else {
            return 0.115704;
          }
        } else {
          if (f[15] <= 0.000018) {
            if (f[4] <= 0.000983) {
              if (f[4] <= 0.000350) {
                if (f[9] <= 0.508367) {
                  return 0.036384;
                } else {
                  return -0.103340;
                }
              } else {
                if (f[9] <= 0.544071) {
                  return -0.093206;
                } else {
                  return 0.036977;
                }
              }
            } else {
              if (f[9] <= 0.510208) {
                return -0.066561;
              } else {
                return 0.067351;
              }
            }
          } else {
            if (f[14] <= 0.001294) {
              if (f[8] <= 0.000410) {
                return 0.101835;
              } else {
                if (f[1] <= 3.769872) {
                  return 0.006813;
                } else {
                  return 0.090878;
                }
              }
            } else {
              if (f[6] <= 0.000491) {
                if (f[3] <= 0.000212) {
                  return -0.146293;
                } else {
                  return -0.044237;
                }
              } else {
                return 0.047162;
              }
            }
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[15] <= 0.000001) {
        if (f[1] <= -5.497707) {
          if (f[19] <= 0.002582) {
            return 0.085917;
          } else {
            if (f[8] <= -0.000659) {
              return 0.047307;
            } else {
              if (f[1] <= -5.526992) {
                return -0.108701;
              } else {
                return 0.025428;
              }
            }
          }
        } else {
          if (f[18] <= 0.021667) {
            if (f[1] <= -4.363436) {
              return 0.096774;
            } else {
              if (f[8] <= -0.000529) {
                if (f[19] <= 0.002583) {
                  return -0.094386;
                } else {
                  return -0.153527;
                }
              } else {
                if (f[10] <= 0.518523) {
                  return 0.005474;
                } else {
                  return -0.114915;
                }
              }
            }
          } else {
            if (f[15] <= -0.000010) {
              if (f[4] <= -0.000289) {
                if (f[4] <= -0.000301) {
                  return -0.128459;
                } else {
                  return -0.134573;
                }
              } else {
                return -0.035154;
              }
            } else {
              if (f[1] <= -5.077795) {
                if (f[18] <= 0.121667) {
                  return -0.129388;
                } else {
                  return -0.040327;
                }
              } else {
                if (f[2] <= 0.001291) {
                  return -0.054926;
                } else {
                  return -0.004168;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000149) {
          if (f[15] <= 0.000006) {
            return 0.080292;
          } else {
            if (f[0] <= 38.108938) {
              if (f[19] <= 0.002583) {
                return 0.110121;
              } else {
                return 0.110987;
              }
            } else {
              return 0.114373;
            }
          }
        } else {
          if (f[15] <= 0.000018) {
            if (f[4] <= 0.000983) {
              if (f[6] <= 0.000308) {
                if (f[19] <= 0.002584) {
                  return -0.085352;
                } else {
                  return -0.006083;
                }
              } else {
                return -0.101206;
              }
            } else {
              if (f[1] <= 5.860953) {
                return -0.021537;
              } else {
                return 0.050576;
              }
            }
          } else {
            if (f[14] <= 0.001294) {
              if (f[15] <= 0.000029) {
                if (f[14] <= 0.000744) {
                  return 0.094055;
                } else {
                  return -0.005530;
                }
              } else {
                return 0.100392;
              }
            } else {
              if (f[1] <= 4.783048) {
                if (f[8] <= 0.001259) {
                  return -0.143744;
                } else {
                  return -0.029902;
                }
              } else {
                return 0.044663;
              }
            }
          }
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[15] <= 0.000001) {
        if (f[16] <= 0.220223) {
          if (f[9] <= 0.524142) {
            if (f[9] <= 0.517281) {
              if (f[9] <= 0.484279) {
                if (f[17] <= 0.505775) {
                  return 0.107323;
                } else {
                  return 0.041858;
                }
              } else {
                if (f[3] <= 0.000139) {
                  return -0.046253;
                } else {
                  return 0.078518;
                }
              }
            } else {
              return 0.093385;
            }
          } else {
            if (f[10] <= 0.506681) {
              if (f[9] <= 0.538079) {
                return -0.138660;
              } else {
                return -0.004008;
              }
            } else {
              return 0.085640;
            }
          }
        } else {
          if (f[8] <= -0.000645) {
            if (f[4] <= -0.000291) {
              if (f[17] <= 0.602251) {
                if (f[18] <= 0.135000) {
                  return -0.056845;
                } else {
                  return 0.020996;
                }
              } else {
                if (f[4] <= -0.000297) {
                  return 0.037710;
                } else {
                  return -0.069040;
                }
              }
            } else {
              return 0.055083;
            }
          } else {
            if (f[14] <= -0.000169) {
              if (f[15] <= 0.000000) {
                if (f[5] <= 0.001064) {
                  return -0.071343;
                } else {
                  return -0.002334;
                }
              } else {
                if (f[9] <= 0.520984) {
                  return -0.048859;
                } else {
                  return 0.080896;
                }
              }
            } else {
              if (f[5] <= -0.000580) {
                if (f[2] <= 0.001406) {
                  return -0.140140;
                } else {
                  return 0.002648;
                }
              } else {
                if (f[4] <= -0.000276) {
                  return 0.059929;
                } else {
                  return -0.011916;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000149) {
          return 0.101034;
        } else {
          if (f[15] <= 0.000018) {
            if (f[16] <= 0.121540) {
              if (f[9] <= 0.523262) {
                return -0.149111;
              } else {
                return -0.035558;
              }
            } else {
              if (f[16] <= 0.405205) {
                if (f[5] <= 0.001053) {
                  return -0.006853;
                } else {
                  return 0.043208;
                }
              } else {
                return -0.093469;
              }
            }
          } else {
            if (f[14] <= 0.000901) {
              return 0.082860;
            } else {
              if (f[1] <= 4.783048) {
                if (f[3] <= 0.000159) {
                  return 0.045663;
                } else {
                  return -0.074986;
                }
              } else {
                return 0.052682;
              }
            }
          }
        }
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[16] <= 0.426675) {
        if (f[17] <= 0.509261) {
          if (f[9] <= 0.485771) {
            return 0.067503;
          } else {
            if (f[9] <= 0.523063) {
              if (f[17] <= 0.497063) {
                if (f[16] <= 0.202429) {
                  return 0.010007;
                } else {
                  return -0.069429;
                }
              } else {
                return 0.050254;
              }
            } else {
              if (f[1] <= -4.555258) {
                return -0.141585;
              } else {
                if (f[16] <= 0.348521) {
                  return 0.021411;
                } else {
                  return 0.100666;
                }
              }
            }
          }
        } else {
          if (f[19] <= 0.002586) {
            if (f[17] <= 0.574214) {
              if (f[2] <= 0.001316) {
                if (f[18] <= 0.015000) {
                  return -0.017633;
                } else {
                  return -0.128284;
                }
              } else {
                if (f[19] <= 0.002583) {
                  return -0.068736;
                } else {
                  return 0.038766;
                }
              }
            } else {
              if (f[1] <= -4.579346) {
                return 0.111105;
              } else {
                if (f[5] <= -0.000610) {
                  return -0.031827;
                } else {
                  return 0.052092;
                }
              }
            }
          } else {
            if (f[5] <= 0.000116) {
              if (f[16] <= 0.310405) {
                if (f[2] <= 0.001160) {
                  return -0.145193;
                } else {
                  return -0.011618;
                }
              } else {
                return -0.122401;
              }
            } else {
              if (f[4] <= 0.001816) {
                if (f[7] <= -0.934190) {
                  return 0.025744;
                } else {
                  return -0.032050;
                }
              } else {
                return 0.064050;
              }
            }
          }
        }
      } else {
        if (f[1] <= -5.497707) {
          if (f[16] <= 0.591957) {
            return 0.060591;
          } else {
            return -0.028211;
          }
        } else {
          if (f[9] <= 0.487845) {
            if (f[6] <= 0.000047) {
              if (f[2] <= 0.001435) {
                if (f[1] <= -5.357359) {
                  return -0.041213;
                } else {
                  return 0.078232;
                }
              } else {
                return -0.058166;
              }
            } else {
              if (f[16] <= 0.482922) {
                if (f[19] <= 0.002585) {
                  return 0.018046;
                } else {
                  return -0.117301;
                }
              } else {
                if (f[2] <= 0.001436) {
                  return -0.124652;
                } else {
                  return -0.001719;
                }
              }
            }
          } else {
            if (f[4] <= -0.000296) {
              return -0.119131;
            } else {
              return -0.021775;
            }
          }
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[16] <= 0.216876) {
          if (f[8] <= 0.000352) {
            if (f[6] <= 0.000355) {
              if (f[14] <= -0.000188) {
                return 0.056006;
              } else {
                if (f[15] <= -0.000007) {
                  return -0.094958;
                } else {
                  return 0.008297;
                }
              }
            } else {
              if (f[17] <= 0.483233) {
                return 0.132021;
              } else {
                return 0.052461;
              }
            }
          } else {
            if (f[17] <= 0.607123) {
              return -0.114445;
            } else {
              return -0.000577;
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[7] <= -0.976718) {
              if (f[15] <= -0.000011) {
                return -0.121440;
              } else {
                if (f[6] <= 0.000405) {
                  return -0.009151;
                } else {
                  return 0.079443;
                }
              }
            } else {
              if (f[2] <= 0.003164) {
                if (f[8] <= -0.000653) {
                  return -0.009191;
                } else {
                  return -0.086520;
                }
              } else {
                if (f[6] <= 0.000539) {
                  return 0.053983;
                } else {
                  return -0.055227;
                }
              }
            }
          } else {
            if (f[18] <= 0.051667) {
              if (f[4] <= 0.000040) {
                if (f[15] <= 0.000000) {
                  return 0.101987;
                } else {
                  return 0.033061;
                }
              } else {
                return -0.021657;
              }
            } else {
              if (f[18] <= 0.135000) {
                if (f[19] <= 0.002583) {
                  return -0.071691;
                } else {
                  return -0.000509;
                }
              } else {
                if (f[11] <= 0.360106) {
                  return -0.039137;
                } else {
                  return 0.034887;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000083) {
          return 0.104007;
        } else {
          if (f[16] <= 0.421003) {
            if (f[6] <= 0.000178) {
              if (f[2] <= 0.001130) {
                return 0.030433;
              } else {
                return -0.111010;
              }
            } else {
              if (f[18] <= 0.011667) {
                if (f[5] <= 0.001515) {
                  return -0.013796;
                } else {
                  return 0.043424;
                }
              } else {
                if (f[15] <= 0.000011) {
                  return 0.008969;
                } else {
                  return 0.079161;
                }
              }
            }
          } else {
            if (f[16] <= 0.502981) {
              if (f[14] <= 0.001294) {
                return -0.072299;
              } else {
                return 0.037211;
              }
            } else {
              return -0.122303;
            }
          }
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[16] <= 0.225070) {
          if (f[9] <= 0.524142) {
            if (f[9] <= 0.517281) {
              if (f[9] <= 0.510867) {
                if (f[5] <= 0.000608) {
                  return 0.019266;
                } else {
                  return 0.094507;
                }
              } else {
                return -0.094085;
              }
            } else {
              return 0.077831;
            }
          } else {
            if (f[6] <= 0.000286) {
              if (f[0] <= 55.614092) {
                return -0.073061;
              } else {
                return 0.083739;
              }
            } else {
              return -0.130182;
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[7] <= -0.976718) {
              if (f[15] <= -0.000010) {
                return -0.094461;
              } else {
                if (f[6] <= 0.000405) {
                  return -0.005288;
                } else {
                  return 0.084690;
                }
              }
            } else {
              if (f[9] <= 0.499816) {
                if (f[9] <= 0.486604) {
                  return -0.047310;
                } else {
                  return -0.115545;
                }
              } else {
                if (f[9] <= 0.507232) {
                  return 0.039598;
                } else {
                  return -0.037367;
                }
              }
            }
          } else {
            if (f[1] <= -5.497707) {
              if (f[18] <= 0.225000) {
                if (f[14] <= -0.000180) {
                  return 0.047404;
                } else {
                  return -0.016653;
                }
              } else {
                return 0.095271;
              }
            } else {
              if (f[16] <= 0.431145) {
                if (f[17] <= 0.586190) {
                  return -0.004413;
                } else {
                  return 0.060244;
                }
              } else {
                if (f[16] <= 0.553354) {
                  return -0.062598;
                } else {
                  return 0.028820;
                }
              }
            }
          }
        }
      } else {
        if (f[5] <= -0.000360) {
          return 0.101103;
        } else {
          if (f[16] <= 0.424677) {
            if (f[14] <= 0.000298) {
              if (f[15] <= 0.000011) {
                return 0.022636;
              } else {
                return 0.087599;
              }
            } else {
              if (f[15] <= 0.000016) {
                if (f[9] <= 0.525246) {
                  return -0.064161;
                } else {
                  return 0.010204;
                }
              } else {
                if (f[1] <= 4.783048) {
                  return -0.000394;
                } else {
                  return 0.064558;
                }
              }
            }
          } else {
            if (f[16] <= 0.502981) {
              if (f[0] <= 76.794323) {
                return -0.061463;
              } else {
                return 0.040456;
              }
            } else {
              return -0.117541;
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[4] <= -0.000292) {
          if (f[16] <= 0.090775) {
            if (f[0] <= 58.314416) {
              return -0.143707;
            } else {
              return -0.088183;
            }
          } else {
            if (f[16] <= 0.225070) {
              if (f[16] <= 0.100054) {
                return 0.085313;
              } else {
                if (f[9] <= 0.484279) {
                  return 0.057981;
                } else {
                  return -0.007786;
                }
              }
            } else {
              if (f[8] <= -0.000636) {
                if (f[17] <= 0.605261) {
                  return -0.031900;
                } else {
                  return 0.029669;
                }
              } else {
                if (f[2] <= 0.003226) {
                  return -0.067646;
                } else {
                  return 0.009374;
                }
              }
            }
          }
        } else {
          if (f[4] <= -0.000280) {
            if (f[16] <= 0.466094) {
              if (f[7] <= -0.934190) {
                if (f[2] <= 0.000786) {
                  return -0.145543;
                } else {
                  return 0.051311;
                }
              } else {
                if (f[9] <= 0.495526) {
                  return 0.037059;
                } else {
                  return -0.136192;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                if (f[15] <= 0.000000) {
                  return -0.039757;
                } else {
                  return 0.104318;
                }
              } else {
                return -0.134720;
              }
            }
          } else {
            if (f[17] <= 0.701515) {
              if (f[17] <= 0.534335) {
                if (f[5] <= 0.000616) {
                  return -0.019921;
                } else {
                  return 0.078124;
                }
              } else {
                if (f[1] <= 0.736333) {
                  return -0.013704;
                } else {
                  return -0.098259;
                }
              }
            } else {
              return 0.069273;
            }
          }
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[8] <= -0.000636) {
            return 0.097422;
          } else {
            return 0.102103;
          }
        } else {
          if (f[6] <= 0.000176) {
            if (f[2] <= 0.001213) {
              return -0.006341;
            } else {
              return -0.131163;
            }
          } else {
            if (f[4] <= 0.000350) {
              return 0.092231;
            } else {
              if (f[1] <= 4.504040) {
                if (f[19] <= 0.002613) {
                  return 0.006409;
                } else {
                  return -0.143304;
                }
              } else {
                if (f[9] <= 0.507877) {
                  return -0.033778;
                } else {
                  return 0.055251;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[15] <= 0.000001) {
        if (f[16] <= 0.216876) {
          if (f[8] <= 0.000392) {
            if (f[0] <= 53.828575) {
              if (f[7] <= -0.954492) {
                if (f[15] <= -0.000002) {
                  return 0.050393;
                } else {
                  return -0.069776;
                }
              } else {
                return -0.127914;
              }
            } else {
              if (f[17] <= 0.000000) {
                return -0.166008;
              } else {
                if (f[4] <= -0.000293) {
                  return 0.025087;
                } else {
                  return 0.085446;
                }
              }
            }
          } else {
            return -0.064050;
          }
        } else {
          if (f[8] <= -0.000645) {
            if (f[4] <= -0.000291) {
              if (f[14] <= -0.000191) {
                if (f[14] <= -0.000194) {
                  return -0.011696;
                } else {
                  return 0.067291;
                }
              } else {
                if (f[17] <= 0.687944) {
                  return -0.027485;
                } else {
                  return 0.044385;
                }
              }
            } else {
              if (f[3] <= 0.000059) {
                return 0.078135;
              } else {
                return 0.016562;
              }
            }
          } else {
            if (f[14] <= -0.000167) {
              if (f[15] <= 0.000000) {
                if (f[6] <= 0.000402) {
                  return -0.066555;
                } else {
                  return -0.021618;
                }
              } else {
                if (f[7] <= -0.976476) {
                  return -0.036452;
                } else {
                  return 0.065068;
                }
              }
            } else {
              if (f[18] <= 0.118333) {
                if (f[16] <= 0.437828) {
                  return 0.019908;
                } else {
                  return -0.122919;
                }
              } else {
                return 0.072809;
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000149) {
          if (f[15] <= 0.000004) {
            return 0.050625;
          } else {
            return 0.097890;
          }
        } else {
          if (f[16] <= 0.136876) {
            if (f[4] <= 0.000400) {
              return -0.114443;
            } else {
              return -0.016201;
            }
          } else {
            if (f[16] <= 0.421003) {
              if (f[18] <= 0.011667) {
                if (f[6] <= 0.000656) {
                  return -0.006515;
                } else {
                  return 0.066463;
                }
              } else {
                if (f[1] <= -3.369376) {
                  return -0.069580;
                } else {
                  return 0.050525;
                }
              }
            } else {
              if (f[17] <= 0.624215) {
                if (f[17] <= 0.513547) {
                  return -0.005629;
                } else {
                  return -0.127068;
                }
              } else {
                return 0.024700;
              }
            }
          }
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[16] <= 0.225070) {
          if (f[8] <= 0.000352) {
            if (f[6] <= 0.000355) {
              if (f[14] <= -0.000188) {
                if (f[14] <= -0.000191) {
                  return 0.003679;
                } else {
                  return 0.084433;
                }
              } else {
                if (f[15] <= -0.000007) {
                  return -0.093316;
                } else {
                  return 0.006499;
                }
              }
            } else {
              if (f[17] <= 0.486418) {
                return 0.120973;
              } else {
                return 0.040046;
              }
            }
          } else {
            if (f[19] <= 0.002598) {
              return -0.137211;
            } else {
              return 0.012899;
            }
          }
        } else {
          if (f[15] <= -0.000010) {
            if (f[8] <= 0.000421) {
              return -0.107390;
            } else {
              if (f[6] <= 0.000543) {
                return 0.058070;
              } else {
                if (f[6] <= 0.000705) {
                  return -0.127090;
                } else {
                  return 0.012537;
                }
              }
            }
          } else {
            if (f[17] <= 0.636733) {
              if (f[14] <= -0.000174) {
                if (f[15] <= -0.000003) {
                  return -0.071243;
                } else {
                  return -0.018344;
                }
              } else {
                if (f[6] <= 0.000306) {
                  return -0.006107;
                } else {
                  return 0.054407;
                }
              }
            } else {
              if (f[18] <= 0.061667) {
                if (f[19] <= 0.002585) {
                  return 0.069352;
                } else {
                  return -0.006099;
                }
              } else {
                if (f[1] <= -4.340499) {
                  return 0.012219;
                } else {
                  return -0.111561;
                }
              }
            }
          }
        }
      } else {
        if (f[8] <= -0.000330) {
          return 0.093909;
        } else {
          if (f[16] <= 0.424677) {
            if (f[14] <= 0.000298) {
              if (f[15] <= 0.000010) {
                if (f[17] <= 0.566293) {
                  return 0.039619;
                } else {
                  return -0.002650;
                }
              } else {
                return 0.076983;
              }
            } else {
              if (f[15] <= 0.000012) {
                if (f[17] <= 0.608908) {
                  return -0.072919;
                } else {
                  return -0.010512;
                }
              } else {
                if (f[15] <= 0.000037) {
                  return 0.007009;
                } else {
                  return 0.064925;
                }
              }
            }
          } else {
            if (f[16] <= 0.502981) {
              if (f[15] <= 0.000025) {
                return -0.059449;
              } else {
                return 0.044929;
              }
            } else {
              return -0.111266;
            }
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[4] <= -0.000292) {
          if (f[9] <= 0.549036) {
            if (f[9] <= 0.546362) {
              if (f[17] <= 0.622012) {
                if (f[14] <= -0.000178) {
                  return -0.013577;
                } else {
                  return -0.056474;
                }
              } else {
                if (f[15] <= -0.000008) {
                  return -0.054005;
                } else {
                  return 0.026368;
                }
              }
            } else {
              return 0.116954;
            }
          } else {
            return -0.123923;
          }
        } else {
          if (f[4] <= -0.000280) {
            if (f[16] <= 0.466094) {
              if (f[7] <= -0.934190) {
                if (f[2] <= 0.000786) {
                  return -0.138324;
                } else {
                  return 0.046129;
                }
              } else {
                if (f[9] <= 0.491783) {
                  return 0.037910;
                } else {
                  return -0.128411;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                if (f[15] <= 0.000000) {
                  return -0.034353;
                } else {
                  return 0.096209;
                }
              } else {
                return -0.128421;
              }
            }
          } else {
            if (f[17] <= 0.701515) {
              if (f[14] <= -0.000176) {
                if (f[14] <= -0.000183) {
                  return -0.021189;
                } else {
                  return -0.134974;
                }
              } else {
                if (f[17] <= 0.658173) {
                  return 0.000926;
                } else {
                  return -0.096742;
                }
              }
            } else {
              return 0.061015;
            }
          }
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[18] <= 0.095000) {
            if (f[3] <= 0.000095) {
              return 0.095179;
            } else {
              return 0.097814;
            }
          } else {
            return 0.090603;
          }
        } else {
          if (f[15] <= 0.000018) {
            if (f[16] <= 0.401838) {
              if (f[5] <= 0.000681) {
                if (f[5] <= 0.000327) {
                  return -0.000106;
                } else {
                  return -0.131538;
                }
              } else {
                if (f[9] <= 0.510208) {
                  return -0.047483;
                } else {
                  return 0.044838;
                }
              }
            } else {
              return -0.091375;
            }
          } else {
            if (f[8] <= 0.000410) {
              return 0.082635;
            } else {
              if (f[6] <= 0.000491) {
                if (f[14] <= 0.001243) {
                  return 0.020359;
                } else {
                  return -0.077566;
                }
              } else {
                if (f[17] <= 0.607123) {
                  return 0.013422;
                } else {
                  return 0.072079;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[15] <= 0.000002) {
        if (f[16] <= 0.216876) {
          if (f[8] <= 0.000392) {
            if (f[19] <= 0.002591) {
              if (f[14] <= -0.000168) {
                if (f[16] <= 0.090775) {
                  return -0.087464;
                } else {
                  return 0.014598;
                }
              } else {
                return 0.064426;
              }
            } else {
              if (f[0] <= 59.406433) {
                return 0.026914;
              } else {
                return 0.085930;
              }
            }
          } else {
            return -0.052829;
          }
        } else {
          if (f[1] <= -5.497707) {
            if (f[16] <= 0.591957) {
              if (f[18] <= 0.165000) {
                if (f[7] <= -0.976297) {
                  return -0.017762;
                } else {
                  return 0.066896;
                }
              } else {
                return 0.088573;
              }
            } else {
              return -0.041187;
            }
          } else {
            if (f[18] <= 0.151667) {
              if (f[16] <= 0.556063) {
                if (f[1] <= -5.092373) {
                  return -0.064625;
                } else {
                  return -0.013869;
                }
              } else {
                return 0.074871;
              }
            } else {
              if (f[14] <= -0.000171) {
                if (f[15] <= -0.000000) {
                  return -0.109722;
                } else {
                  return -0.121421;
                }
              } else {
                return 0.018698;
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[15] <= 0.000005) {
            return 0.060066;
          } else {
            if (f[0] <= 38.108938) {
              if (f[18] <= 0.078333) {
                return 0.093855;
              } else {
                return 0.093269;
              }
            } else {
              return 0.095916;
            }
          }
        } else {
          if (f[12] <= 9.330210) {
            return 0.085627;
          } else {
            if (f[16] <= 0.439584) {
              if (f[15] <= 0.000018) {
                if (f[16] <= 0.121540) {
                  return -0.070317;
                } else {
                  return -0.001538;
                }
              } else {
                if (f[8] <= 0.000410) {
                  return 0.082077;
                } else {
                  return 0.012642;
                }
              }
            } else {
              if (f[4] <= 0.001349) {
                return -0.042825;
              } else {
                if (f[1] <= 3.589239) {
                  return -0.105515;
                } else {
                  return -0.129491;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[15] <= 0.000009) {
        if (f[14] <= 0.000440) {
          if (f[14] <= -0.000168) {
            if (f[17] <= 0.718743) {
              if (f[12] <= 8.048202) {
                if (f[14] <= -0.000171) {
                  return -0.097097;
                } else {
                  return 0.027056;
                }
              } else {
                if (f[1] <= -5.615610) {
                  return 0.063051;
                } else {
                  return -0.011396;
                }
              }
            } else {
              if (f[9] <= 0.489328) {
                return 0.092907;
              } else {
                return 0.024971;
              }
            }
          } else {
            if (f[17] <= 0.669961) {
              if (f[9] <= 0.512505) {
                if (f[6] <= 0.000184) {
                  return 0.000073;
                } else {
                  return 0.066622;
                }
              } else {
                if (f[10] <= 0.500338) {
                  return -0.072836;
                } else {
                  return 0.059237;
                }
              }
            } else {
              return -0.058624;
            }
          }
        } else {
          if (f[9] <= 0.516927) {
            return -0.135393;
          } else {
            return -0.026214;
          }
        }
      } else {
        if (f[4] <= 0.000144) {
          if (f[1] <= -3.124405) {
            return 0.087198;
          } else {
            return 0.095970;
          }
        } else {
          if (f[1] <= 4.783048) {
            if (f[4] <= 0.001118) {
              if (f[6] <= 0.000211) {
                return -0.055182;
              } else {
                if (f[14] <= 0.000744) {
                  return 0.088390;
                } else {
                  return 0.014395;
                }
              }
            } else {
              if (f[15] <= 0.000040) {
                if (f[3] <= 0.000196) {
                  return -0.143842;
                } else {
                  return -0.055930;
                }
              } else {
                return -0.003638;
              }
            }
          } else {
            if (f[0] <= 81.454360) {
              return 0.064845;
            } else {
              if (f[9] <= 0.527486) {
                return -0.043289;
              } else {
                return 0.060341;
              }
            }
          }
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[18] <= 0.021667) {
          if (f[1] <= -4.707337) {
            return 0.106764;
          } else {
            if (f[9] <= 0.469588) {
              if (f[19] <= 0.002584) {
                return -0.128179;
              } else {
                if (f[8] <= 0.000229) {
                  return 0.051297;
                } else {
                  return -0.088736;
                }
              }
            } else {
              if (f[9] <= 0.484279) {
                if (f[17] <= 0.511848) {
                  return 0.090953;
                } else {
                  return -0.004980;
                }
              } else {
                if (f[9] <= 0.496382) {
                  return -0.044898;
                } else {
                  return 0.008722;
                }
              }
            }
          }
        } else {
          if (f[7] <= -0.942909) {
            if (f[9] <= 0.469588) {
              if (f[1] <= -4.402793) {
                if (f[18] <= 0.101667) {
                  return 0.110878;
                } else {
                  return 0.019571;
                }
              } else {
                if (f[5] <= -0.000586) {
                  return -0.088714;
                } else {
                  return 0.071990;
                }
              }
            } else {
              if (f[17] <= 0.636733) {
                if (f[9] <= 0.475796) {
                  return -0.101879;
                } else {
                  return -0.021336;
                }
              } else {
                if (f[18] <= 0.061667) {
                  return 0.051650;
                } else {
                  return -0.025714;
                }
              }
            }
          } else {
            if (f[14] <= 0.000998) {
              if (f[5] <= 0.000927) {
                return -0.112692;
              } else {
                return -0.136870;
              }
            } else {
              return -0.091262;
            }
          }
        }
      } else {
        if (f[10] <= 0.510492) {
          if (f[18] <= 0.015000) {
            return 0.028590;
          } else {
            if (f[17] <= 0.557565) {
              return 0.110688;
            } else {
              return 0.074582;
            }
          }
        } else {
          if (f[17] <= 0.535995) {
            if (f[1] <= -2.116549) {
              return -0.038998;
            } else {
              return 0.092352;
            }
          } else {
            if (f[9] <= 0.548094) {
              if (f[14] <= -0.000181) {
                return -0.007313;
              } else {
                if (f[14] <= -0.000164) {
                  return -0.130672;
                } else {
                  return -0.152495;
                }
              }
            } else {
              if (f[14] <= -0.000174) {
                return -0.041313;
              } else {
                return 0.048682;
              }
            }
          }
        }
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[15] <= 0.000002) {
        if (f[16] <= 0.216876) {
          if (f[9] <= 0.524142) {
            if (f[9] <= 0.517281) {
              if (f[9] <= 0.507232) {
                if (f[5] <= 0.000608) {
                  return 0.014095;
                } else {
                  return 0.088748;
                }
              } else {
                return -0.083907;
              }
            } else {
              return 0.073428;
            }
          } else {
            if (f[10] <= 0.506681) {
              if (f[9] <= 0.538079) {
                if (f[1] <= 0.950670) {
                  return -0.130338;
                } else {
                  return -0.115602;
                }
              } else {
                return 0.002754;
              }
            } else {
              return 0.066490;
            }
          }
        } else {
          if (f[2] <= 0.001278) {
            if (f[15] <= -0.000001) {
              if (f[14] <= -0.000191) {
                return 0.018973;
              } else {
                if (f[1] <= -3.808642) {
                  return -0.028512;
                } else {
                  return -0.101262;
                }
              }
            } else {
              if (f[17] <= 0.556344) {
                return -0.032726;
              } else {
                return 0.050215;
              }
            }
          } else {
            if (f[19] <= 0.002586) {
              if (f[6] <= 0.000405) {
                if (f[9] <= 0.539385) {
                  return -0.007384;
                } else {
                  return 0.059541;
                }
              } else {
                return 0.117887;
              }
            } else {
              if (f[2] <= 0.003164) {
                if (f[15] <= -0.000002) {
                  return -0.078664;
                } else {
                  return 0.044886;
                }
              } else {
                if (f[2] <= 0.003574) {
                  return 0.079911;
                } else {
                  return -0.022113;
                }
              }
            }
          }
        }
      } else {
        if (f[5] <= -0.000436) {
          if (f[19] <= 0.002583) {
            return 0.074354;
          } else {
            return 0.100142;
          }
        } else {
          if (f[1] <= -3.656694) {
            return -0.081644;
          } else {
            if (f[12] <= 9.330210) {
              return 0.077595;
            } else {
              if (f[16] <= 0.439584) {
                if (f[15] <= 0.000012) {
                  return -0.003233;
                } else {
                  return 0.028920;
                }
              } else {
                if (f[7] <= -0.920743) {
                  return -0.039672;
                } else {
                  return -0.116964;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[15] <= 0.000002) {
        if (f[9] <= 0.557391) {
          if (f[14] <= -0.000168) {
            if (f[4] <= -0.000282) {
              if (f[15] <= 0.000001) {
                if (f[16] <= 0.090775) {
                  return -0.070484;
                } else {
                  return -0.002942;
                }
              } else {
                return -0.114668;
              }
            } else {
              if (f[9] <= 0.532464) {
                if (f[4] <= 0.000655) {
                  return -0.103123;
                } else {
                  return -0.029030;
                }
              } else {
                return 0.034745;
              }
            }
          } else {
            if (f[1] <= 3.326575) {
              if (f[16] <= 0.316437) {
                if (f[19] <= 0.002585) {
                  return -0.002898;
                } else {
                  return 0.087799;
                }
              } else {
                if (f[5] <= -0.000580) {
                  return -0.032913;
                } else {
                  return 0.038438;
                }
              }
            } else {
              if (f[0] <= 78.496872) {
                return -0.086859;
              } else {
                return 0.038480;
              }
            }
          }
        } else {
          return -0.095040;
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[15] <= 0.000005) {
            return 0.051013;
          } else {
            if (f[0] <= 22.702100) {
              if (f[15] <= 0.000015) {
                return 0.090896;
              } else {
                return 0.090001;
              }
            } else {
              return 0.092752;
            }
          }
        } else {
          if (f[16] <= 0.129865) {
            if (f[9] <= 0.523262) {
              return -0.126517;
            } else {
              return 0.002340;
            }
          } else {
            if (f[3] <= 0.000086) {
              return -0.072530;
            } else {
              if (f[4] <= 0.000238) {
                return 0.102287;
              } else {
                if (f[6] <= 0.000656) {
                  return -0.003901;
                } else {
                  return 0.053279;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[18] <= 0.228333) {
          if (f[18] <= 0.178333) {
            if (f[3] <= 0.000060) {
              if (f[2] <= 0.001394) {
                if (f[18] <= 0.111667) {
                  return -0.053858;
                } else {
                  return 0.049964;
                }
              } else {
                if (f[4] <= -0.000291) {
                  return 0.011421;
                } else {
                  return 0.066518;
                }
              }
            } else {
              if (f[18] <= 0.021667) {
                if (f[3] <= 0.000305) {
                  return 0.007096;
                } else {
                  return -0.048427;
                }
              } else {
                if (f[2] <= 0.002035) {
                  return -0.014467;
                } else {
                  return -0.098050;
                }
              }
            }
          } else {
            if (f[12] <= -0.212050) {
              return -0.053763;
            } else {
              if (f[9] <= 0.490640) {
                return -0.151417;
              } else {
                return -0.116187;
              }
            }
          }
        } else {
          if (f[2] <= 0.001406) {
            return -0.009905;
          } else {
            return 0.086393;
          }
        }
      } else {
        if (f[10] <= 0.510492) {
          if (f[2] <= 0.001284) {
            return 0.019690;
          } else {
            if (f[17] <= 0.584266) {
              return 0.104832;
            } else {
              return 0.058025;
            }
          }
        } else {
          if (f[17] <= 0.535995) {
            if (f[6] <= 0.000187) {
              return -0.021405;
            } else {
              return 0.069256;
            }
          } else {
            if (f[4] <= 0.000536) {
              if (f[4] <= -0.000290) {
                if (f[6] <= 0.000232) {
                  return 0.020443;
                } else {
                  return -0.118726;
                }
              } else {
                return -0.131863;
              }
            } else {
              return 0.013202;
            }
          }
        }
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[15] <= 0.000009) {
        if (f[14] <= 0.000440) {
          if (f[14] <= -0.000168) {
            if (f[17] <= 0.718743) {
              if (f[12] <= 8.048202) {
                if (f[19] <= 0.002582) {
                  return 0.028727;
                } else {
                  return -0.101113;
                }
              } else {
                if (f[1] <= -5.615610) {
                  return 0.059001;
                } else {
                  return -0.009156;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                return 0.014154;
              } else {
                return 0.074215;
              }
            }
          } else {
            if (f[9] <= 0.512505) {
              if (f[6] <= 0.000178) {
                if (f[6] <= 0.000098) {
                  return 0.018713;
                } else {
                  return -0.096913;
                }
              } else {
                if (f[9] <= 0.498548) {
                  return 0.026733;
                } else {
                  return 0.088169;
                }
              }
            } else {
              if (f[6] <= 0.000275) {
                if (f[14] <= -0.000162) {
                  return 0.072013;
                } else {
                  return -0.051048;
                }
              } else {
                return -0.123362;
              }
            }
          }
        } else {
          if (f[6] <= 0.000513) {
            return -0.107034;
          } else {
            return -0.007517;
          }
        }
      } else {
        if (f[14] <= -0.000167) {
          if (f[19] <= 0.002608) {
            if (f[14] <= -0.000180) {
              return 0.083866;
            } else {
              return 0.093010;
            }
          } else {
            return 0.014823;
          }
        } else {
          if (f[9] <= 0.548094) {
            if (f[9] <= 0.503683) {
              if (f[3] <= 0.000155) {
                return 0.058792;
              } else {
                if (f[9] <= 0.497525) {
                  return -0.065505;
                } else {
                  return 0.054901;
                }
              }
            } else {
              if (f[1] <= 4.905222) {
                if (f[6] <= 0.000302) {
                  return -0.028584;
                } else {
                  return -0.144818;
                }
              } else {
                return 0.023758;
              }
            }
          } else {
            return 0.058645;
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[15] <= 0.000002) {
        if (f[16] <= 0.220223) {
          if (f[9] <= 0.524142) {
            if (f[9] <= 0.517281) {
              if (f[9] <= 0.507232) {
                if (f[9] <= 0.484279) {
                  return 0.051448;
                } else {
                  return 0.002794;
                }
              } else {
                return -0.074943;
              }
            } else {
              return 0.068316;
            }
          } else {
            if (f[10] <= 0.506681) {
              if (f[9] <= 0.538079) {
                if (f[1] <= 0.950670) {
                  return -0.122259;
                } else {
                  return -0.110318;
                }
              } else {
                return 0.005318;
              }
            } else {
              return 0.061714;
            }
          }
        } else {
          if (f[2] <= 0.000786) {
            return -0.115442;
          } else {
            if (f[15] <= -0.000005) {
              if (f[6] <= 0.000405) {
                if (f[4] <= -0.000306) {
                  return 0.010521;
                } else {
                  return -0.100203;
                }
              } else {
                if (f[19] <= 0.002586) {
                  return 0.100460;
                } else {
                  return -0.023058;
                }
              }
            } else {
              if (f[16] <= 0.391489) {
                if (f[4] <= -0.000130) {
                  return 0.030243;
                } else {
                  return -0.052404;
                }
              } else {
                if (f[4] <= -0.000303) {
                  return -0.032840;
                } else {
                  return 0.001967;
                }
              }
            }
          }
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[15] <= 0.000005) {
            return 0.047877;
          } else {
            if (f[3] <= 0.000095) {
              if (f[15] <= 0.000015) {
                return 0.089432;
              } else {
                return 0.088311;
              }
            } else {
              return 0.091301;
            }
          }
        } else {
          if (f[3] <= 0.000086) {
            return -0.066522;
          } else {
            if (f[4] <= 0.000144) {
              return 0.096870;
            } else {
              if (f[6] <= 0.000656) {
                if (f[9] <= 0.548094) {
                  return -0.013720;
                } else {
                  return 0.046197;
                }
              } else {
                return 0.050866;
              }
            }
          }
        }
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[15] <= 0.000002) {
        if (f[9] <= 0.557391) {
          if (f[10] <= 0.537618) {
            if (f[5] <= -0.000604) {
              if (f[14] <= -0.000190) {
                if (f[2] <= 0.001442) {
                  return 0.046856;
                } else {
                  return -0.033636;
                }
              } else {
                if (f[2] <= 0.001278) {
                  return -0.112554;
                } else {
                  return -0.028584;
                }
              }
            } else {
              if (f[4] <= -0.000317) {
                return -0.066062;
              } else {
                if (f[16] <= 0.428621) {
                  return 0.007968;
                } else {
                  return -0.012554;
                }
              }
            }
          } else {
            return 0.093818;
          }
        } else {
          return -0.087189;
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[15] <= 0.000005) {
            return 0.044715;
          } else {
            if (f[0] <= 40.070110) {
              if (f[15] <= 0.000015) {
                return 0.088627;
              } else {
                return 0.087610;
              }
            } else {
              return 0.090323;
            }
          }
        } else {
          if (f[3] <= 0.000086) {
            return -0.061918;
          } else {
            if (f[4] <= 0.000179) {
              return 0.084815;
            } else {
              if (f[9] <= 0.561357) {
                if (f[2] <= 0.001272) {
                  return -0.046836;
                } else {
                  return 0.001619;
                }
              } else {
                return 0.055109;
              }
            }
          }
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[15] <= 0.000011) {
        if (f[14] <= 0.000744) {
          if (f[5] <= -0.000626) {
            if (f[19] <= 0.002583) {
              if (f[4] <= -0.000318) {
                return 0.034778;
              } else {
                return -0.054256;
              }
            } else {
              return -0.128346;
            }
          } else {
            if (f[14] <= -0.000191) {
              if (f[9] <= 0.527646) {
                if (f[5] <= -0.000615) {
                  return 0.067163;
                } else {
                  return -0.014479;
                }
              } else {
                return 0.076829;
              }
            } else {
              if (f[5] <= -0.000604) {
                if (f[17] <= 0.470294) {
                  return 0.021887;
                } else {
                  return -0.038444;
                }
              } else {
                if (f[10] <= 0.533289) {
                  return 0.002531;
                } else {
                  return -0.057299;
                }
              }
            }
          }
        } else {
          return -0.080541;
        }
      } else {
        if (f[4] <= 0.000144) {
          if (f[3] <= 0.000070) {
            return 0.087016;
          } else {
            return 0.091569;
          }
        } else {
          if (f[2] <= 0.001343) {
            if (f[16] <= 0.212228) {
              return 0.002813;
            } else {
              return -0.103740;
            }
          } else {
            if (f[3] <= 0.000148) {
              return 0.062435;
            } else {
              if (f[7] <= -0.929245) {
                return -0.091078;
              } else {
                if (f[17] <= 0.642498) {
                  return -0.004463;
                } else {
                  return 0.057571;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[15] <= -0.000000) {
        if (f[18] <= 0.135000) {
          if (f[1] <= -4.732390) {
            if (f[17] <= 0.529104) {
              return -0.015769;
            } else {
              return 0.081787;
            }
          } else {
            if (f[16] <= 0.480700) {
              if (f[19] <= 0.002583) {
                if (f[16] <= 0.468390) {
                  return -0.122796;
                } else {
                  return -0.043586;
                }
              } else {
                if (f[4] <= 0.000699) {
                  return 0.000139;
                } else {
                  return -0.091742;
                }
              }
            } else {
              if (f[17] <= 0.634325) {
                if (f[2] <= 0.001230) {
                  return -0.101082;
                } else {
                  return -0.110839;
                }
              } else {
                return -0.008480;
              }
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[1] <= -5.482979) {
              return -0.135567;
            } else {
              return -0.102300;
            }
          } else {
            return -0.032581;
          }
        }
      } else {
        if (f[1] <= -5.497707) {
          if (f[16] <= 0.591957) {
            if (f[18] <= 0.165000) {
              if (f[2] <= 0.001440) {
                return -0.006351;
              } else {
                return 0.070153;
              }
            } else {
              return 0.092837;
            }
          } else {
            return -0.012757;
          }
        } else {
          if (f[16] <= 0.434046) {
            if (f[4] <= -0.000130) {
              if (f[15] <= 0.000002) {
                if (f[15] <= 0.000001) {
                  return 0.030729;
                } else {
                  return -0.052601;
                }
              } else {
                if (f[14] <= -0.000178) {
                  return 0.076022;
                } else {
                  return 0.095781;
                }
              }
            } else {
              if (f[15] <= 0.000037) {
                if (f[19] <= 0.002584) {
                  return -0.056857;
                } else {
                  return 0.003362;
                }
              } else {
                return 0.052618;
              }
            }
          } else {
            if (f[16] <= 0.553354) {
              if (f[15] <= 0.000001) {
                if (f[17] <= 0.586942) {
                  return -0.034312;
                } else {
                  return -0.119832;
                }
              } else {
                if (f[17] <= 0.499589) {
                  return 0.076949;
                } else {
                  return -0.027677;
                }
              }
            } else {
              if (f[4] <= -0.000293) {
                return 0.071108;
              } else {
                return -0.031684;
              }
            }
          }
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[15] <= -0.000011) {
        if (f[18] <= 0.015000) {
          if (f[15] <= -0.000013) {
            if (f[6] <= 0.000543) {
              return 0.067280;
            } else {
              if (f[2] <= 0.005353) {
                return -0.082630;
              } else {
                return 0.043841;
              }
            }
          } else {
            return -0.069036;
          }
        } else {
          if (f[17] <= 0.498311) {
            return 0.010283;
          } else {
            if (f[6] <= 0.000513) {
              if (f[0] <= 62.251624) {
                return -0.122020;
              } else {
                return -0.103513;
              }
            } else {
              if (f[5] <= -0.000609) {
                return -0.099242;
              } else {
                if (f[18] <= 0.028333) {
                  return -0.108890;
                } else {
                  return -0.104225;
                }
              }
            }
          }
        }
      } else {
        if (f[17] <= 0.639074) {
          if (f[5] <= 0.002227) {
            if (f[6] <= 0.000513) {
              if (f[2] <= 0.001943) {
                if (f[5] <= 0.000626) {
                  return -0.005257;
                } else {
                  return 0.056563;
                }
              } else {
                if (f[1] <= 4.634625) {
                  return -0.096985;
                } else {
                  return -0.000717;
                }
              }
            } else {
              if (f[4] <= 0.000238) {
                if (f[2] <= 0.002545) {
                  return 0.029426;
                } else {
                  return 0.112409;
                }
              } else {
                return 0.005758;
              }
            }
          } else {
            if (f[15] <= 0.000031) {
              return -0.110242;
            } else {
              return -0.015405;
            }
          }
        } else {
          if (f[6] <= 0.000394) {
            if (f[6] <= 0.000300) {
              if (f[15] <= -0.000003) {
                return 0.073398;
              } else {
                if (f[4] <= -0.000304) {
                  return -0.055745;
                } else {
                  return 0.025405;
                }
              }
            } else {
              if (f[19] <= 0.002585) {
                return -0.011571;
              } else {
                if (f[7] <= -0.939195) {
                  return -0.147969;
                } else {
                  return -0.060058;
                }
              }
            }
          } else {
            if (f[1] <= -0.058910) {
              return 0.089637;
            } else {
              if (f[1] <= 4.229611) {
                return -0.027041;
              } else {
                if (f[5] <= 0.001637) {
                  return 0.085205;
                } else {
                  return 0.022471;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[15] <= -0.000000) {
        if (f[1] <= -5.077795) {
          if (f[15] <= -0.000000) {
            if (f[1] <= -5.490311) {
              return -0.130215;
            } else {
              if (f[18] <= 0.178333) {
                return -0.110593;
              } else {
                return -0.097066;
              }
            }
          } else {
            return -0.003445;
          }
        } else {
          if (f[1] <= -4.732390) {
            if (f[3] <= 0.000061) {
              return 0.112691;
            } else {
              return 0.006902;
            }
          } else {
            if (f[16] <= 0.480700) {
              if (f[19] <= 0.002583) {
                if (f[3] <= 0.000062) {
                  return -0.119209;
                } else {
                  return -0.043246;
                }
              } else {
                if (f[9] <= 0.458652) {
                  return -0.064532;
                } else {
                  return 0.000870;
                }
              }
            } else {
              if (f[1] <= -4.439626) {
                return -0.007467;
              } else {
                if (f[2] <= 0.001230) {
                  return -0.098248;
                } else {
                  return -0.109188;
                }
              }
            }
          }
        }
      } else {
        if (f[18] <= 0.228333) {
          if (f[18] <= 0.178333) {
            if (f[6] <= 0.000007) {
              if (f[2] <= 0.001410) {
                return 0.104234;
              } else {
                return 0.038495;
              }
            } else {
              if (f[16] <= 0.431145) {
                if (f[4] <= -0.000130) {
                  return 0.035641;
                } else {
                  return 0.001782;
                }
              } else {
                if (f[9] <= 0.452577) {
                  return 0.045742;
                } else {
                  return -0.034091;
                }
              }
            }
          } else {
            if (f[12] <= 8.177249) {
              return -0.055139;
            } else {
              return -0.138750;
            }
          }
        } else {
          if (f[15] <= 0.000000) {
            return 0.003572;
          } else {
            return 0.098764;
          }
        }
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[15] <= 0.000011) {
        if (f[8] <= -0.000666) {
          if (f[1] <= -4.707337) {
            if (f[6] <= 0.000052) {
              if (f[14] <= -0.000183) {
                return -0.025719;
              } else {
                return 0.071508;
              }
            } else {
              return 0.111513;
            }
          } else {
            if (f[1] <= -2.937150) {
              if (f[18] <= 0.045000) {
                return 0.036338;
              } else {
                if (f[6] <= 0.000115) {
                  return -0.108875;
                } else {
                  return -0.132574;
                }
              }
            } else {
              return 0.046552;
            }
          }
        } else {
          if (f[5] <= -0.000604) {
            if (f[17] <= 0.442132) {
              return 0.058807;
            } else {
              if (f[2] <= 0.001435) {
                if (f[17] <= 0.583498) {
                  return -0.052067;
                } else {
                  return 0.026428;
                }
              } else {
                if (f[14] <= -0.000174) {
                  return -0.094770;
                } else {
                  return 0.022492;
                }
              }
            }
          } else {
            if (f[10] <= 0.533289) {
              if (f[14] <= 0.000440) {
                if (f[3] <= 0.000271) {
                  return 0.004214;
                } else {
                  return -0.068507;
                }
              } else {
                if (f[8] <= 0.001706) {
                  return -0.104605;
                } else {
                  return 0.053410;
                }
              }
            } else {
              if (f[18] <= 0.041667) {
                if (f[18] <= 0.011667) {
                  return -0.071347;
                } else {
                  return -0.124013;
                }
              } else {
                return 0.019026;
              }
            }
          }
        }
      } else {
        if (f[14] <= 0.000241) {
          if (f[19] <= 0.002616) {
            if (f[16] <= 0.364157) {
              return 0.092761;
            } else {
              return 0.084825;
            }
          } else {
            return -0.000968;
          }
        } else {
          if (f[2] <= 0.001343) {
            if (f[0] <= 52.489129) {
              return 0.024864;
            } else {
              return -0.109472;
            }
          } else {
            if (f[3] <= 0.000148) {
              return 0.053742;
            } else {
              if (f[1] <= 1.776341) {
                return -0.100394;
              } else {
                if (f[17] <= 0.481269) {
                  return 0.064792;
                } else {
                  return -0.001496;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[9] <= 0.489328) {
          if (f[6] <= 0.000577) {
            if (f[6] <= 0.000520) {
              if (f[8] <= 0.000434) {
                if (f[5] <= -0.000596) {
                  return -0.007024;
                } else {
                  return 0.025737;
                }
              } else {
                if (f[16] <= 0.434046) {
                  return -0.137057;
                } else {
                  return -0.042757;
                }
              }
            } else {
              return 0.078824;
            }
          } else {
            if (f[16] <= 0.335836) {
              return -0.006053;
            } else {
              if (f[9] <= 0.474568) {
                return -0.081472;
              } else {
                return -0.116834;
              }
            }
          }
        } else {
          if (f[9] <= 0.494820) {
            if (f[15] <= 0.000000) {
              if (f[5] <= 0.000845) {
                if (f[16] <= 0.238979) {
                  return -0.131707;
                } else {
                  return -0.109433;
                }
              } else {
                return -0.077217;
              }
            } else {
              if (f[9] <= 0.491075) {
                return 0.045231;
              } else {
                if (f[5] <= -0.000328) {
                  return -0.032934;
                } else {
                  return -0.105475;
                }
              }
            }
          } else {
            if (f[6] <= 0.000063) {
              if (f[19] <= 0.002582) {
                if (f[1] <= -4.998835) {
                  return -0.023621;
                } else {
                  return 0.074436;
                }
              } else {
                if (f[16] <= 0.477324) {
                  return -0.120772;
                } else {
                  return -0.085180;
                }
              }
            } else {
              if (f[14] <= -0.000189) {
                if (f[9] <= 0.532464) {
                  return 0.018963;
                } else {
                  return 0.074369;
                }
              } else {
                if (f[5] <= -0.000615) {
                  return -0.092892;
                } else {
                  return 0.000516;
                }
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.510492) {
          if (f[15] <= -0.000000) {
            return 0.023726;
          } else {
            return 0.081931;
          }
        } else {
          if (f[5] <= -0.000599) {
            return 0.060618;
          } else {
            if (f[5] <= 0.000080) {
              if (f[16] <= 0.428621) {
                if (f[10] <= 0.529671) {
                  return -0.129054;
                } else {
                  return -0.094006;
                }
              } else {
                return -0.047441;
              }
            } else {
              if (f[7] <= -0.947766) {
                return 0.074044;
              } else {
                if (f[5] <= 0.001339) {
                  return -0.107377;
                } else {
                  return 0.029034;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[17] <= 0.636733) {
          if (f[7] <= -0.887853) {
            if (f[9] <= 0.508749) {
              if (f[9] <= 0.505379) {
                if (f[9] <= 0.503683) {
                  return 0.000224;
                } else {
                  return -0.077461;
                }
              } else {
                if (f[19] <= 0.002583) {
                  return 0.006261;
                } else {
                  return 0.082209;
                }
              }
            } else {
              if (f[9] <= 0.516927) {
                if (f[6] <= 0.000375) {
                  return -0.095332;
                } else {
                  return 0.005219;
                }
              } else {
                if (f[3] <= 0.000129) {
                  return -0.027016;
                } else {
                  return 0.024904;
                }
              }
            }
          } else {
            if (f[9] <= 0.524286) {
              return -0.147915;
            } else {
              return -0.051881;
            }
          }
        } else {
          if (f[9] <= 0.510867) {
            if (f[17] <= 0.665132) {
              if (f[9] <= 0.476874) {
                return -0.002349;
              } else {
                if (f[9] <= 0.489328) {
                  return 0.096104;
                } else {
                  return 0.017599;
                }
              }
            } else {
              if (f[9] <= 0.501857) {
                if (f[17] <= 0.718743) {
                  return -0.038713;
                } else {
                  return 0.050425;
                }
              } else {
                if (f[19] <= 0.002585) {
                  return -0.138368;
                } else {
                  return -0.069270;
                }
              }
            }
          } else {
            if (f[19] <= 0.002584) {
              return 0.075638;
            } else {
              if (f[2] <= 0.002454) {
                if (f[1] <= 0.394137) {
                  return 0.024468;
                } else {
                  return -0.116264;
                }
              } else {
                if (f[1] <= 11.983576) {
                  return 0.079838;
                } else {
                  return 0.021120;
                }
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.510492) {
          if (f[18] <= 0.015000) {
            return 0.014967;
          } else {
            if (f[2] <= 0.001405) {
              return 0.057208;
            } else {
              return 0.089349;
            }
          }
        } else {
          if (f[17] <= 0.535995) {
            if (f[1] <= -2.116549) {
              return -0.034642;
            } else {
              return 0.075506;
            }
          } else {
            if (f[9] <= 0.548094) {
              if (f[14] <= -0.000181) {
                return -0.008047;
              } else {
                return -0.125584;
              }
            } else {
              if (f[4] <= 0.000582) {
                return -0.019129;
              } else {
                return 0.043791;
              }
            }
          }
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[1] <= -5.509066) {
        if (f[19] <= 0.002582) {
          return 0.067794;
        } else {
          if (f[8] <= -0.000659) {
            if (f[19] <= 0.002582) {
              return 0.007653;
            } else {
              return 0.065889;
            }
          } else {
            return -0.041141;
          }
        }
      } else {
        if (f[1] <= -5.077795) {
          if (f[2] <= 0.001414) {
            if (f[15] <= -0.000000) {
              if (f[14] <= -0.000186) {
                return -0.036722;
              } else {
                return -0.104916;
              }
            } else {
              if (f[1] <= -5.279331) {
                if (f[1] <= -5.357359) {
                  return 0.004958;
                } else {
                  return 0.107715;
                }
              } else {
                return -0.063495;
              }
            }
          } else {
            if (f[5] <= -0.000620) {
              return -0.002539;
            } else {
              if (f[1] <= -5.203610) {
                if (f[19] <= 0.002582) {
                  return -0.124137;
                } else {
                  return -0.106217;
                }
              } else {
                return -0.074808;
              }
            }
          }
        } else {
          if (f[1] <= -4.732390) {
            if (f[19] <= 0.002582) {
              return 0.092560;
            } else {
              if (f[8] <= -0.000660) {
                return 0.070961;
              } else {
                if (f[3] <= 0.000061) {
                  return 0.027878;
                } else {
                  return -0.059284;
                }
              }
            }
          } else {
            if (f[1] <= -3.097948) {
              if (f[15] <= 0.000000) {
                if (f[2] <= 0.001430) {
                  return -0.025173;
                } else {
                  return -0.109770;
                }
              } else {
                if (f[15] <= 0.000001) {
                  return 0.060785;
                } else {
                  return -0.017517;
                }
              }
            } else {
              if (f[8] <= -0.000653) {
                if (f[4] <= -0.000313) {
                  return 0.100402;
                } else {
                  return 0.023130;
                }
              } else {
                if (f[17] <= 0.509261) {
                  return 0.017649;
                } else {
                  return -0.009291;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[15] <= 0.000005) {
        if (f[17] <= 0.742336) {
          if (f[16] <= 0.225070) {
            if (f[9] <= 0.524142) {
              if (f[9] <= 0.518770) {
                if (f[5] <= 0.000608) {
                  return 0.000307;
                } else {
                  return 0.080440;
                }
              } else {
                return 0.065595;
              }
            } else {
              if (f[9] <= 0.537323) {
                if (f[10] <= 0.502075) {
                  return -0.110723;
                } else {
                  return -0.036766;
                }
              } else {
                return 0.010202;
              }
            }
          } else {
            if (f[16] <= 0.348521) {
              if (f[5] <= 0.000681) {
                if (f[1] <= -3.837696) {
                  return 0.070955;
                } else {
                  return -0.067721;
                }
              } else {
                if (f[0] <= 74.396723) {
                  return 0.049860;
                } else {
                  return -0.059520;
                }
              }
            } else {
              if (f[9] <= 0.487845) {
                if (f[9] <= 0.487256) {
                  return 0.005093;
                } else {
                  return 0.100499;
                }
              } else {
                if (f[9] <= 0.498548) {
                  return -0.074810;
                } else {
                  return 0.001050;
                }
              }
            }
          }
        } else {
          return 0.048035;
        }
      } else {
        if (f[4] <= -0.000130) {
          if (f[18] <= 0.085000) {
            if (f[15] <= 0.000013) {
              return 0.088742;
            } else {
              return 0.085846;
            }
          } else {
            return 0.078895;
          }
        } else {
          if (f[12] <= 9.333704) {
            return 0.069741;
          } else {
            if (f[16] <= 0.439584) {
              if (f[9] <= 0.548094) {
                if (f[9] <= 0.511584) {
                  return 0.016656;
                } else {
                  return -0.023368;
                }
              } else {
                return 0.047411;
              }
            } else {
              if (f[18] <= 0.051667) {
                return -0.105006;
              } else {
                return -0.023370;
              }
            }
          }
        }
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[0] <= 90.129442) {
        if (f[3] <= 0.000344) {
          if (f[15] <= 0.000019) {
            if (f[5] <= 0.002227) {
              if (f[8] <= 0.000942) {
                if (f[15] <= -0.000011) {
                  return -0.036233;
                } else {
                  return 0.000082;
                }
              } else {
                if (f[5] <= 0.001339) {
                  return 0.072129;
                } else {
                  return -0.021054;
                }
              }
            } else {
              return -0.078480;
            }
          } else {
            if (f[14] <= 0.000586) {
              return 0.087394;
            } else {
              if (f[9] <= 0.504642) {
                if (f[0] <= 63.309551) {
                  return 0.072767;
                } else {
                  return -0.001145;
                }
              } else {
                if (f[7] <= -0.892554) {
                  return -0.045871;
                } else {
                  return 0.044486;
                }
              }
            }
          }
        } else {
          return -0.114568;
        }
      } else {
        return 0.095748;
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[6] <= 0.000004) {
        return 0.069534;
      } else {
        if (f[16] <= 0.426675) {
          if (f[19] <= 0.002583) {
            if (f[19] <= 0.002582) {
              return 0.005808;
            } else {
              return -0.120327;
            }
          } else {
            if (f[1] <= -4.707337) {
              return 0.069001;
            } else {
              if (f[15] <= -0.000011) {
                if (f[15] <= -0.000013) {
                  return 0.000950;
                } else {
                  return -0.098677;
                }
              } else {
                if (f[6] <= 0.000513) {
                  return 0.002580;
                } else {
                  return 0.036443;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.476874) {
            if (f[1] <= -4.402793) {
              if (f[16] <= 0.520322) {
                if (f[2] <= 0.001421) {
                  return 0.041085;
                } else {
                  return 0.107444;
                }
              } else {
                if (f[16] <= 0.556063) {
                  return -0.110302;
                } else {
                  return 0.043878;
                }
              }
            } else {
              if (f[0] <= 32.039074) {
                if (f[16] <= 0.468390) {
                  return 0.018030;
                } else {
                  return -0.107084;
                }
              } else {
                return 0.092927;
              }
            }
          } else {
            if (f[14] <= -0.000184) {
              if (f[6] <= 0.000275) {
                if (f[6] <= 0.000010) {
                  return -0.034856;
                } else {
                  return -0.102824;
                }
              } else {
                return -0.010243;
              }
            } else {
              if (f[16] <= 0.579541) {
                if (f[19] <= 0.002583) {
                  return 0.018488;
                } else {
                  return -0.042703;
                }
              } else {
                return -0.116576;
              }
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[6] <= 0.000004) {
        return 0.064029;
      } else {
        if (f[16] <= 0.600249) {
          if (f[1] <= -5.588043) {
            return 0.061807;
          } else {
            if (f[16] <= 0.426675) {
              if (f[8] <= -0.000636) {
                if (f[6] <= 0.000237) {
                  return 0.031744;
                } else {
                  return -0.071724;
                }
              } else {
                if (f[19] <= 0.002584) {
                  return -0.038842;
                } else {
                  return 0.003566;
                }
              }
            } else {
              if (f[16] <= 0.553354) {
                if (f[16] <= 0.521212) {
                  return -0.013768;
                } else {
                  return -0.061385;
                }
              } else {
                if (f[6] <= 0.000015) {
                  return 0.003899;
                } else {
                  return 0.100778;
                }
              }
            }
          }
        } else {
          if (f[18] <= 0.228333) {
            if (f[1] <= -5.509066) {
              return -0.134602;
            } else {
              return -0.107225;
            }
          } else {
            return 0.028268;
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[3] <= 0.000060) {
          if (f[9] <= 0.503223) {
            if (f[15] <= 0.000000) {
              if (f[6] <= 0.000075) {
                if (f[1] <= -5.092373) {
                  return 0.043466;
                } else {
                  return 0.095694;
                }
              } else {
                if (f[6] <= 0.000263) {
                  return -0.077027;
                } else {
                  return 0.052894;
                }
              }
            } else {
              if (f[15] <= 0.000001) {
                if (f[9] <= 0.469040) {
                  return -0.044665;
                } else {
                  return -0.126183;
                }
              } else {
                return 0.069683;
              }
            }
          } else {
            if (f[4] <= -0.000287) {
              if (f[3] <= 0.000059) {
                if (f[8] <= -0.000647) {
                  return -0.032988;
                } else {
                  return -0.114562;
                }
              } else {
                return 0.032174;
              }
            } else {
              return 0.042981;
            }
          }
        } else {
          if (f[16] <= 0.278474) {
            if (f[3] <= 0.000125) {
              if (f[9] <= 0.521979) {
                if (f[3] <= 0.000119) {
                  return 0.014122;
                } else {
                  return -0.079631;
                }
              } else {
                return -0.115985;
              }
            } else {
              if (f[9] <= 0.538079) {
                if (f[9] <= 0.526334) {
                  return 0.025382;
                } else {
                  return -0.078994;
                }
              } else {
                return 0.081792;
              }
            }
          } else {
            if (f[15] <= 0.000000) {
              if (f[8] <= -0.000655) {
                if (f[4] <= -0.000312) {
                  return 0.036059;
                } else {
                  return -0.013654;
                }
              } else {
                if (f[9] <= 0.540608) {
                  return -0.043612;
                } else {
                  return 0.041383;
                }
              }
            } else {
              if (f[9] <= 0.454203) {
                return 0.113330;
              } else {
                if (f[12] <= 9.333704) {
                  return 0.088950;
                } else {
                  return -0.007386;
                }
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.510492) {
          if (f[15] <= -0.000000) {
            return 0.016640;
          } else {
            return 0.073848;
          }
        } else {
          if (f[16] <= 0.104375) {
            return 0.050099;
          } else {
            if (f[10] <= 0.531481) {
              if (f[10] <= 0.514203) {
                return -0.015435;
              } else {
                return -0.121280;
              }
            } else {
              if (f[16] <= 0.345718) {
                return -0.059531;
              } else {
                return 0.052473;
              }
            }
          }
        }
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[0] <= 89.350131) {
        if (f[0] <= 85.214683) {
          if (f[2] <= 0.004959) {
            if (f[6] <= 0.000567) {
              if (f[1] <= 6.128071) {
                if (f[0] <= 63.787051) {
                  return 0.002554;
                } else {
                  return -0.030549;
                }
              } else {
                if (f[1] <= 9.285354) {
                  return 0.054574;
                } else {
                  return -0.028590;
                }
              }
            } else {
              if (f[4] <= -0.000286) {
                if (f[8] <= 0.000768) {
                  return -0.109932;
                } else {
                  return -0.031483;
                }
              } else {
                if (f[8] <= 0.001034) {
                  return 0.042577;
                } else {
                  return -0.046409;
                }
              }
            }
          } else {
            return 0.059291;
          }
        } else {
          return -0.094522;
        }
      } else {
        return 0.060938;
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[5] <= -0.000626) {
        if (f[1] <= -4.439626) {
          return 0.013782;
        } else {
          if (f[16] <= 0.398101) {
            return -0.120746;
          } else {
            return -0.107724;
          }
        }
      } else {
        if (f[5] <= -0.000624) {
          return 0.073287;
        } else {
          if (f[9] <= 0.437583) {
            return -0.067406;
          } else {
            if (f[9] <= 0.455689) {
              if (f[2] <= 0.001413) {
                return 0.067100;
              } else {
                if (f[17] <= 0.550124) {
                  return 0.056805;
                } else {
                  return -0.115251;
                }
              }
            } else {
              if (f[9] <= 0.460327) {
                if (f[17] <= 0.590743) {
                  return -0.121768;
                } else {
                  return -0.002952;
                }
              } else {
                if (f[17] <= 0.636733) {
                  return -0.003268;
                } else {
                  return 0.014205;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[17] <= 0.509261) {
        if (f[9] <= 0.476874) {
          if (f[9] <= 0.467168) {
            if (f[2] <= 0.001401) {
              return 0.045931;
            } else {
              if (f[14] <= -0.000178) {
                return 0.002952;
              } else {
                return -0.132151;
              }
            }
          } else {
            if (f[3] <= 0.000061) {
              return 0.004694;
            } else {
              if (f[6] <= 0.000154) {
                return 0.144410;
              } else {
                return 0.058379;
              }
            }
          }
        } else {
          if (f[9] <= 0.523063) {
            if (f[4] <= -0.000292) {
              if (f[6] <= 0.000282) {
                if (f[18] <= 0.255000) {
                  return -0.099166;
                } else {
                  return 0.054575;
                }
              } else {
                if (f[2] <= 0.001830) {
                  return 0.068903;
                } else {
                  return -0.080569;
                }
              }
            } else {
              if (f[9] <= 0.485771) {
                return 0.066934;
              } else {
                if (f[2] <= 0.001721) {
                  return 0.006851;
                } else {
                  return -0.087328;
                }
              }
            }
          } else {
            return 0.031293;
          }
        }
      } else {
        if (f[15] <= -0.000005) {
          if (f[9] <= 0.498548) {
            if (f[4] <= -0.000317) {
              return 0.045837;
            } else {
              if (f[15] <= -0.000010) {
                return -0.111134;
              } else {
                if (f[5] <= -0.000597) {
                  return -0.118343;
                } else {
                  return -0.002611;
                }
              }
            }
          } else {
            if (f[9] <= 0.503966) {
              return 0.093215;
            } else {
              if (f[14] <= -0.000190) {
                return 0.043004;
              } else {
                if (f[5] <= 0.002300) {
                  return -0.070416;
                } else {
                  return 0.039179;
                }
              }
            }
          }
        } else {
          if (f[17] <= 0.602251) {
            if (f[3] <= 0.000059) {
              if (f[5] <= -0.000580) {
                if (f[2] <= 0.001406) {
                  return -0.056005;
                } else {
                  return 0.073757;
                }
              } else {
                return 0.076929;
              }
            } else {
              if (f[6] <= 0.000086) {
                if (f[2] <= 0.001464) {
                  return -0.065352;
                } else {
                  return 0.047514;
                }
              } else {
                if (f[10] <= 0.502588) {
                  return -0.014768;
                } else {
                  return 0.036020;
                }
              }
            }
          } else {
            if (f[7] <= -0.977371) {
              return -0.076688;
            } else {
              return 0.020475;
            }
          }
        }
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[1] <= -5.615610) {
        return 0.039911;
      } else {
        if (f[5] <= -0.000626) {
          if (f[1] <= -4.439626) {
            return -0.000749;
          } else {
            if (f[16] <= 0.398101) {
              return -0.116922;
            } else {
              return -0.105297;
            }
          }
        } else {
          if (f[5] <= -0.000624) {
            return 0.063158;
          } else {
            if (f[16] <= 0.426675) {
              if (f[16] <= 0.418739) {
                if (f[16] <= 0.406653) {
                  return 0.003586;
                } else {
                  return -0.040862;
                }
              } else {
                if (f[4] <= -0.000293) {
                  return 0.061466;
                } else {
                  return -0.005089;
                }
              }
            } else {
              if (f[4] <= -0.000304) {
                if (f[9] <= 0.483521) {
                  return -0.014859;
                } else {
                  return -0.092359;
                }
              } else {
                if (f[1] <= -5.497707) {
                  return 0.034133;
                } else {
                  return -0.010728;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[6] <= 0.000004) {
        return 0.058268;
      } else {
        if (f[12] <= -0.000000) {
          return -0.068337;
        } else {
          if (f[1] <= -5.615610) {
            return 0.049953;
          } else {
            if (f[16] <= 0.426675) {
              if (f[19] <= 0.002583) {
                if (f[2] <= 0.001422) {
                  return -0.120293;
                } else {
                  return 0.005455;
                }
              } else {
                if (f[8] <= -0.000653) {
                  return 0.034076;
                } else {
                  return 0.000929;
                }
              }
            } else {
              if (f[6] <= 0.000046) {
                if (f[1] <= -5.077795) {
                  return -0.015981;
                } else {
                  return 0.052341;
                }
              } else {
                if (f[16] <= 0.478635) {
                  return -0.002802;
                } else {
                  return -0.053289;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[7] <= -0.839113) {
        if (f[3] <= 0.000305) {
          if (f[1] <= 6.128071) {
            if (f[2] <= 0.002204) {
              if (f[5] <= 0.000626) {
                if (f[5] <= 0.000492) {
                  return 0.000824;
                } else {
                  return -0.073213;
                }
              } else {
                if (f[4] <= 0.001021) {
                  return 0.050341;
                } else {
                  return -0.025977;
                }
              }
            } else {
              if (f[5] <= 0.001437) {
                if (f[18] <= 0.000000) {
                  return 0.026346;
                } else {
                  return -0.093752;
                }
              } else {
                if (f[16] <= 0.357696) {
                  return 0.053019;
                } else {
                  return -0.025572;
                }
              }
            }
          } else {
            if (f[9] <= 0.528512) {
              if (f[5] <= 0.001702) {
                if (f[9] <= 0.497525) {
                  return 0.013200;
                } else {
                  return 0.082056;
                }
              } else {
                if (f[1] <= 7.578090) {
                  return 0.068629;
                } else {
                  return -0.062409;
                }
              }
            } else {
              return -0.072752;
            }
          }
        } else {
          if (f[5] <= 0.003108) {
            return -0.130225;
          } else {
            return -0.008369;
          }
        }
      } else {
        return 0.052847;
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[17] <= 0.509261) {
        if (f[17] <= 0.484542) {
          if (f[7] <= -0.918315) {
            if (f[5] <= -0.000272) {
              if (f[8] <= -0.000621) {
                if (f[1] <= -5.588043) {
                  return 0.078063;
                } else {
                  return -0.034963;
                }
              } else {
                if (f[9] <= 0.529077) {
                  return 0.017613;
                } else {
                  return 0.091206;
                }
              }
            } else {
              if (f[9] <= 0.516927) {
                if (f[0] <= 55.711664) {
                  return -0.055658;
                } else {
                  return -0.131915;
                }
              } else {
                if (f[2] <= 0.001519) {
                  return -0.022884;
                } else {
                  return 0.053065;
                }
              }
            }
          } else {
            return 0.055565;
          }
        } else {
          if (f[16] <= 0.529225) {
            if (f[9] <= 0.470070) {
              return 0.093621;
            } else {
              if (f[18] <= 0.005000) {
                return -0.027366;
              } else {
                if (f[1] <= -2.516674) {
                  return 0.009598;
                } else {
                  return 0.057015;
                }
              }
            }
          } else {
            return -0.053673;
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          if (f[2] <= 0.001394) {
            if (f[16] <= 0.543400) {
              if (f[9] <= 0.498548) {
                return -0.114409;
              } else {
                if (f[4] <= -0.000284) {
                  return -0.058628;
                } else {
                  return 0.032245;
                }
              }
            } else {
              return 0.095853;
            }
          } else {
            return 0.039051;
          }
        } else {
          if (f[17] <= 0.574214) {
            if (f[17] <= 0.565489) {
              if (f[3] <= 0.000129) {
                if (f[7] <= -0.953099) {
                  return -0.027794;
                } else {
                  return -0.131431;
                }
              } else {
                if (f[0] <= 66.373333) {
                  return 0.053601;
                } else {
                  return -0.029641;
                }
              }
            } else {
              return -0.094507;
            }
          } else {
            if (f[1] <= 0.099405) {
              if (f[1] <= -0.610043) {
                if (f[9] <= 0.505150) {
                  return -0.013054;
                } else {
                  return 0.024392;
                }
              } else {
                return 0.070796;
              }
            } else {
              if (f[1] <= 2.324147) {
                if (f[1] <= 0.471026) {
                  return -0.002928;
                } else {
                  return -0.102443;
                }
              } else {
                if (f[9] <= 0.497525) {
                  return -0.047356;
                } else {
                  return 0.012356;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[15] <= 0.000016) {
        if (f[14] <= -0.000032) {
          if (f[14] <= -0.000168) {
            if (f[15] <= 0.000002) {
              if (f[15] <= 0.000001) {
                if (f[4] <= -0.000283) {
                  return -0.002178;
                } else {
                  return -0.039754;
                }
              } else {
                if (f[4] <= -0.000275) {
                  return -0.107165;
                } else {
                  return -0.002062;
                }
              }
            } else {
              if (f[4] <= 0.000144) {
                if (f[1] <= -2.605702) {
                  return 0.040289;
                } else {
                  return 0.092646;
                }
              } else {
                if (f[8] <= 0.000712) {
                  return -0.030613;
                } else {
                  return 0.039769;
                }
              }
            }
          } else {
            if (f[1] <= 3.283171) {
              if (f[8] <= -0.000605) {
                if (f[15] <= 0.000000) {
                  return 0.010245;
                } else {
                  return -0.081342;
                }
              } else {
                if (f[15] <= -0.000000) {
                  return 0.037491;
                } else {
                  return 0.096909;
                }
              }
            } else {
              return -0.045987;
            }
          }
        } else {
          if (f[19] <= 0.002585) {
            if (f[15] <= 0.000006) {
              return -0.127339;
            } else {
              return -0.048296;
            }
          } else {
            if (f[4] <= 0.000350) {
              return 0.027404;
            } else {
              if (f[19] <= 0.002627) {
                if (f[6] <= 0.000298) {
                  return -0.012815;
                } else {
                  return -0.109424;
                }
              } else {
                return 0.027430;
              }
            }
          }
        }
      } else {
        if (f[4] <= 0.000350) {
          return 0.086971;
        } else {
          if (f[3] <= 0.000148) {
            return 0.032657;
          } else {
            if (f[1] <= 4.783048) {
              if (f[15] <= 0.000040) {
                if (f[16] <= 0.403305) {
                  return -0.130462;
                } else {
                  return -0.038680;
                }
              } else {
                return 0.014478;
              }
            } else {
              if (f[16] <= 0.392642) {
                return 0.056001;
              } else {
                return -0.003286;
              }
            }
          }
        }
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[9] <= 0.489328) {
        if (f[9] <= 0.482178) {
          if (f[9] <= 0.480765) {
            if (f[1] <= -4.527007) {
              if (f[14] <= -0.000179) {
                if (f[14] <= -0.000182) {
                  return 0.024745;
                } else {
                  return 0.092480;
                }
              } else {
                if (f[3] <= 0.000060) {
                  return 0.018524;
                } else {
                  return -0.072828;
                }
              }
            } else {
              if (f[5] <= -0.000599) {
                if (f[1] <= 5.328955) {
                  return -0.082646;
                } else {
                  return 0.051760;
                }
              } else {
                if (f[4] <= 0.000350) {
                  return 0.017546;
                } else {
                  return -0.056999;
                }
              }
            }
          } else {
            return -0.123595;
          }
        } else {
          if (f[16] <= 0.426675) {
            if (f[9] <= 0.484279) {
              return 0.083895;
            } else {
              if (f[9] <= 0.486604) {
                return -0.050608;
              } else {
                return 0.044722;
              }
            }
          } else {
            if (f[18] <= 0.115000) {
              if (f[1] <= -2.558103) {
                if (f[4] <= -0.000300) {
                  return -0.098665;
                } else {
                  return -0.105237;
                }
              } else {
                return 0.047131;
              }
            } else {
              return 0.064893;
            }
          }
        }
      } else {
        if (f[9] <= 0.494820) {
          if (f[19] <= 0.002582) {
            return 0.033299;
          } else {
            if (f[14] <= 0.000000) {
              if (f[5] <= 0.000845) {
                if (f[5] <= -0.000057) {
                  return -0.099086;
                } else {
                  return -0.128514;
                }
              } else {
                return -0.063735;
              }
            } else {
              return -0.016761;
            }
          }
        } else {
          if (f[19] <= 0.002583) {
            if (f[1] <= -5.558646) {
              return 0.057761;
            } else {
              if (f[18] <= 0.261667) {
                if (f[16] <= 0.374129) {
                  return 0.034854;
                } else {
                  return -0.063360;
                }
              } else {
                return 0.048199;
              }
            }
          } else {
            if (f[18] <= 0.091667) {
              if (f[9] <= 0.508749) {
                if (f[4] <= 0.000350) {
                  return 0.031019;
                } else {
                  return -0.035019;
                }
              } else {
                if (f[5] <= 0.001064) {
                  return -0.016219;
                } else {
                  return 0.023261;
                }
              }
            } else {
              return 0.081852;
            }
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[10] <= 0.500338) {
        if (f[3] <= 0.000305) {
          if (f[3] <= 0.000265) {
            if (f[0] <= 77.571765) {
              if (f[0] <= 76.605671) {
                if (f[0] <= 74.630422) {
                  return -0.001143;
                } else {
                  return -0.116537;
                }
              } else {
                return 0.091691;
              }
            } else {
              if (f[1] <= 6.816175) {
                return 0.001118;
              } else {
                return -0.133390;
              }
            }
          } else {
            return 0.056650;
          }
        } else {
          if (f[19] <= 0.002658) {
            return -0.129047;
          } else {
            return 0.008907;
          }
        }
      } else {
        if (f[10] <= 0.504736) {
          if (f[2] <= 0.001405) {
            return 0.039124;
          } else {
            return 0.076864;
          }
        } else {
          if (f[18] <= 0.011667) {
            if (f[9] <= 0.548094) {
              return -0.086217;
            } else {
              return 0.019992;
            }
          } else {
            if (f[0] <= 44.495795) {
              if (f[2] <= 0.001431) {
                if (f[17] <= 0.450039) {
                  return 0.018268;
                } else {
                  return -0.107942;
                }
              } else {
                return 0.066416;
              }
            } else {
              if (f[17] <= 0.566293) {
                return 0.091232;
              } else {
                return 0.004959;
              }
            }
          }
        }
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[6] <= 0.000004) {
        return 0.053467;
      } else {
        if (f[12] <= -0.000000) {
          return -0.062430;
        } else {
          if (f[1] <= -5.615610) {
            return 0.043422;
          } else {
            if (f[5] <= -0.000626) {
              if (f[4] <= -0.000322) {
                return 0.016493;
              } else {
                if (f[4] <= -0.000312) {
                  return -0.116398;
                } else {
                  return -0.060607;
                }
              }
            } else {
              if (f[14] <= -0.000191) {
                if (f[5] <= -0.000617) {
                  return 0.076751;
                } else {
                  return 0.008021;
                }
              } else {
                if (f[6] <= 0.000859) {
                  return -0.001098;
                } else {
                  return -0.097600;
                }
              }
            }
          }
        }
      }
    })(f)
  ];
  const mainSum = mainScores.reduce((a,b) => a+b, 0);
  const mlProb = 1 / (1 + Math.exp(-mainSum));
  const pred = mlProb > 0.5 ? 1 : 0;
  
  // Meta model: should we take this trade?
  const mf = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0, mlProb];
  const metaScores = [
    // Meta Tree 0
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[59] <= -0.402361) {
          if (f[29] <= 0.245557) {
            if (f[43] <= 0.002977) {
              return 2.237417;
            } else {
              return 2.542766;
            }
          } else {
            if (f[8] <= -0.001217) {
              return 2.444338;
            } else {
              return 2.623415;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            return 2.669974;
          } else {
            if (f[51] <= 0.007419) {
              return 2.671952;
            } else {
              return 2.544489;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[15] <= 0.000237) {
            if (f[41] <= -0.000059) {
              return 2.401092;
            } else {
              return 2.562862;
            }
          } else {
            if (f[61] <= 0.516216) {
              return 2.429164;
            } else {
              return 2.059146;
            }
          }
        } else {
          if (f[50] <= 0.134495) {
            if (f[43] <= 0.004262) {
              return 2.520210;
            } else {
              return 2.671952;
            }
          } else {
            if (f[61] <= 0.791324) {
              return 2.451342;
            } else {
              return 2.640086;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[56] <= -0.081397) {
          if (f[29] <= 0.245557) {
            if (f[42] <= 0.000213) {
              return -0.010138;
            } else {
              return -0.177446;
            }
          } else {
            if (f[43] <= 0.000331) {
              return -0.187720;
            } else {
              return -0.007247;
            }
          }
        } else {
          if (f[20] <= 0.002582) {
            if (f[47] <= 0.327367) {
              return 0.042794;
            } else {
              return -0.157582;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.042345;
            } else {
              return 0.005618;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[19] <= 0.282309) {
            if (f[61] <= 0.562638) {
              return -0.147383;
            } else {
              return 0.000718;
            }
          } else {
            if (f[61] <= 0.521967) {
              return -0.198263;
            } else {
              return -0.347630;
            }
          }
        } else {
          if (f[55] <= 0.419399) {
            if (f[43] <= 0.004262) {
              return -0.052008;
            } else {
              return 0.030945;
            }
          } else {
            return -0.127027;
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[59] <= -0.402361) {
          if (f[29] <= 0.245557) {
            if (f[6] <= 0.000099) {
              return -0.135526;
            } else {
              return 0.020756;
            }
          } else {
            if (f[24] <= 0.708333) {
              return -0.004676;
            } else {
              return -0.154036;
            }
          }
        } else {
          if (f[42] <= 0.000005) {
            if (f[9] <= 0.000060) {
              return -0.112404;
            } else {
              return 0.042669;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.042212;
            } else {
              return 0.004705;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[30] <= 0.094682) {
            if (f[14] <= -0.000309) {
              return -0.209665;
            } else {
              return -0.057590;
            }
          } else {
            if (f[24] <= 0.041667) {
              return -0.260578;
            } else {
              return -0.159916;
            }
          }
        } else {
          if (f[55] <= 0.420639) {
            if (f[39] <= 0.138211) {
              return -0.028909;
            } else {
              return 0.029885;
            }
          } else {
            return -0.146289;
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[56] <= -0.081397) {
          if (f[43] <= 0.008290) {
            if (f[14] <= -0.000264) {
              return -0.107766;
            } else {
              return 0.018285;
            }
          } else {
            if (f[8] <= -0.001205) {
              return -0.132993;
            } else {
              return 0.002255;
            }
          }
        } else {
          if (f[20] <= 0.002582) {
            if (f[47] <= 0.327367) {
              return 0.042635;
            } else {
              return -0.127382;
            }
          } else {
            return 0.040784;
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[15] <= -0.000166) {
            if (f[3] <= 0.001439) {
              return -0.030899;
            } else {
              return -0.169983;
            }
          } else {
            if (f[61] <= 0.516216) {
              return -0.110528;
            } else {
              return -0.202350;
            }
          }
        } else {
          if (f[50] <= 0.134495) {
            if (f[43] <= 0.004262) {
              return -0.089362;
            } else {
              return 0.042699;
            }
          } else {
            if (f[61] <= 0.749567) {
              return -0.168781;
            } else {
              return -0.000307;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[61] <= 0.484838) {
        if (f[56] <= -0.081397) {
          if (f[38] <= 0.150861) {
            if (f[9] <= 0.000138) {
              return -0.038801;
            } else {
              return -0.163228;
            }
          } else {
            if (f[42] <= 0.000005) {
              return -0.101414;
            } else {
              return -0.003200;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[44] <= 0.016653) {
              return 0.007966;
            } else {
              return 0.041974;
            }
          } else {
            if (f[50] <= -0.067704) {
              return -0.131191;
            } else {
              return 0.026470;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[61] <= 0.501038) {
            return -0.051031;
          } else {
            if (f[9] <= 0.000097) {
              return -0.109538;
            } else {
              return -0.237735;
            }
          }
        } else {
          if (f[52] <= -0.409119) {
            if (f[61] <= 0.749567) {
              return -0.134246;
            } else {
              return 0.004897;
            }
          } else {
            if (f[39] <= 0.163188) {
              return -0.053668;
            } else {
              return 0.028242;
            }
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[51] <= 0.112573) {
        if (f[44] <= 0.016657) {
          if (f[50] <= 0.160534) {
            if (f[48] <= 0.691671) {
              return 0.025164;
            } else {
              return -0.026183;
            }
          } else {
            return -0.107037;
          }
        } else {
          if (f[39] <= 0.072114) {
            if (f[39] <= -0.005780) {
              return -0.022017;
            } else {
              return -0.099281;
            }
          } else {
            if (f[31] <= 1.094172) {
              return 0.022204;
            } else {
              return -0.031181;
            }
          }
        }
      } else {
        if (f[9] <= 0.000138) {
          if (f[43] <= 0.001005) {
            return -0.152210;
          } else {
            if (f[24] <= 0.708333) {
              return 0.000886;
            } else {
              return -0.124119;
            }
          }
        } else {
          if (f[44] <= 0.016658) {
            return -0.223411;
          } else {
            if (f[27] <= 0.684378) {
              return -0.088043;
            } else {
              return 0.043148;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[0] <= 51.467165) {
        if (f[60] <= 0.701868) {
          if (f[46] <= 0.111183) {
            if (f[13] <= -0.000193) {
              return 0.001189;
            } else {
              return 0.036702;
            }
          } else {
            if (f[43] <= 0.000793) {
              return -0.146092;
            } else {
              return 0.003199;
            }
          }
        } else {
          return -0.103430;
        }
      } else {
        if (f[0] <= 69.782814) {
          if (f[55] <= 0.420639) {
            if (f[58] <= 0.338804) {
              return -0.010100;
            } else {
              return -0.069564;
            }
          } else {
            return -0.130113;
          }
        } else {
          if (f[9] <= 0.000200) {
            if (f[45] <= 0.713041) {
              return 0.043003;
            } else {
              return 0.012664;
            }
          } else {
            if (f[41] <= 0.000025) {
              return -0.101204;
            } else {
              return 0.030871;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[61] <= 0.484838) {
        if (f[56] <= -0.081397) {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.071453;
            } else {
              return 0.022987;
            }
          } else {
            if (f[14] <= -0.000163) {
              return -0.063993;
            } else {
              return 0.021405;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[20] <= 0.002582) {
              return 0.005802;
            } else {
              return 0.041752;
            }
          } else {
            if (f[55] <= -0.363118) {
              return -0.111887;
            } else {
              return 0.025812;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[14] <= -0.000305) {
            return -0.178829;
          } else {
            if (f[9] <= 0.000097) {
              return -0.049815;
            } else {
              return -0.152500;
            }
          }
        } else {
          if (f[39] <= 0.163188) {
            if (f[61] <= 0.685332) {
              return -0.171595;
            } else {
              return -0.007675;
            }
          } else {
            if (f[54] <= 0.097178) {
              return 0.033602;
            } else {
              return -0.034769;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[56] <= -0.081397) {
          if (f[43] <= 0.008290) {
            if (f[14] <= -0.000264) {
              return -0.073864;
            } else {
              return 0.019616;
            }
          } else {
            if (f[8] <= -0.001198) {
              return -0.087902;
            } else {
              return 0.005291;
            }
          }
        } else {
          if (f[20] <= 0.002582) {
            if (f[47] <= 0.327367) {
              return 0.042355;
            } else {
              return -0.110193;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.041640;
            } else {
              return 0.004267;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[3] <= 0.001439) {
            if (f[45] <= 0.505121) {
              return -0.101912;
            } else {
              return -0.022337;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.088354;
            } else {
              return -0.160919;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            return 0.043007;
          } else {
            if (f[13] <= -0.000172) {
              return 0.031108;
            } else {
              return -0.056706;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[61] <= 0.484838) {
        if (f[56] <= -0.081397) {
          if (f[25] <= 0.750000) {
            if (f[44] <= 0.016653) {
              return -0.060665;
            } else {
              return 0.022830;
            }
          } else {
            if (f[13] <= -0.000150) {
              return -0.052065;
            } else {
              return 0.043286;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[44] <= 0.016653) {
              return 0.005937;
            } else {
              return 0.041532;
            }
          } else {
            if (f[50] <= -0.072403) {
              return -0.101515;
            } else {
              return 0.026456;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[43] <= 0.013781) {
            if (f[30] <= 0.094682) {
              return -0.018184;
            } else {
              return -0.115571;
            }
          } else {
            return -0.133223;
          }
        } else {
          if (f[52] <= -0.409119) {
            if (f[61] <= 0.749567) {
              return -0.094573;
            } else {
              return 0.009211;
            }
          } else {
            if (f[43] <= 0.004262) {
              return -0.079262;
            } else {
              return 0.026677;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[61] <= 0.484838) {
        if (f[56] <= -0.081397) {
          if (f[43] <= 0.008290) {
            if (f[36] <= -0.112181) {
              return -0.002091;
            } else {
              return -0.075447;
            }
          } else {
            if (f[1] <= -5.054191) {
              return -0.046586;
            } else {
              return 0.011054;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[20] <= 0.002582) {
              return 0.005375;
            } else {
              return 0.041425;
            }
          } else {
            if (f[7] <= -0.000245) {
              return -0.064267;
            } else {
              return 0.044316;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[0] <= 54.672970) {
            if (f[61] <= 0.562638) {
              return -0.079481;
            } else {
              return 0.011437;
            }
          } else {
            if (f[13] <= 0.000351) {
              return -0.138167;
            } else {
              return -0.094450;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            return 0.042935;
          } else {
            if (f[13] <= -0.000172) {
              return 0.030652;
            } else {
              return -0.050665;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[56] <= -0.081397) {
          if (f[38] <= 0.150861) {
            if (f[32] <= -0.844774) {
              return 0.033551;
            } else {
              return -0.072437;
            }
          } else {
            if (f[51] <= 0.113352) {
              return 0.022240;
            } else {
              return -0.019189;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[20] <= 0.002582) {
              return 0.005184;
            } else {
              return 0.041322;
            }
          } else {
            if (f[54] <= -0.095989) {
              return -0.087895;
            } else {
              return 0.028918;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[15] <= -0.000015) {
            if (f[41] <= -0.000059) {
              return -0.108355;
            } else {
              return -0.000216;
            }
          } else {
            if (f[56] <= -0.000306) {
              return -0.091386;
            } else {
              return -0.139012;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[50] <= 0.134495) {
              return 0.010890;
            } else {
              return -0.085226;
            }
          } else {
            return 0.036753;
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[0] <= 48.557049) {
        if (f[42] <= 0.000004) {
          if (f[27] <= -3.300492) {
            return -0.182131;
          } else {
            if (f[47] <= 0.394596) {
              return -0.054698;
            } else {
              return 0.045152;
            }
          }
        } else {
          if (f[60] <= 0.701868) {
            if (f[55] <= -0.365271) {
              return 0.002926;
            } else {
              return 0.032174;
            }
          } else {
            return -0.080881;
          }
        }
      } else {
        if (f[51] <= 0.112573) {
          if (f[39] <= 0.072114) {
            if (f[1] <= 1.384798) {
              return 0.002491;
            } else {
              return -0.058244;
            }
          } else {
            if (f[55] <= 0.419240) {
              return 0.015737;
            } else {
              return -0.035863;
            }
          }
        } else {
          if (f[44] <= 0.016659) {
            if (f[14] <= -0.000295) {
              return -0.041412;
            } else {
              return -0.157363;
            }
          } else {
            if (f[8] <= 0.000319) {
              return -0.060929;
            } else {
              return 0.044834;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[0] <= 48.557049) {
        if (f[42] <= 0.000004) {
          if (f[27] <= -3.300492) {
            return -0.151704;
          } else {
            if (f[47] <= 0.394596) {
              return -0.050258;
            } else {
              return 0.044929;
            }
          }
        } else {
          if (f[57] <= 0.450441) {
            if (f[51] <= 0.005171) {
              return 0.036455;
            } else {
              return 0.006657;
            }
          } else {
            return -0.071423;
          }
        }
      } else {
        if (f[51] <= 0.112573) {
          if (f[39] <= 0.072114) {
            if (f[1] <= 1.384798) {
              return 0.002396;
            } else {
              return -0.053953;
            }
          } else {
            if (f[55] <= 0.419240) {
              return 0.015308;
            } else {
              return -0.033557;
            }
          }
        } else {
          if (f[7] <= 0.000238) {
            if (f[42] <= 0.000286) {
              return -0.039090;
            } else {
              return -0.143613;
            }
          } else {
            if (f[32] <= 1.057393) {
              return 0.043952;
            } else {
              return -0.011771;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[59] <= -0.402361) {
          if (f[14] <= -0.000247) {
            if (f[0] <= 48.557049) {
              return -0.006951;
            } else {
              return -0.060336;
            }
          } else {
            if (f[49] <= -0.293024) {
              return -0.019257;
            } else {
              return 0.039266;
            }
          }
        } else {
          if (f[42] <= 0.000005) {
            if (f[20] <= 0.002582) {
              return -0.097059;
            } else {
              return 0.042017;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.041171;
            } else {
              return 0.003622;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[30] <= 0.710416) {
            if (f[61] <= 0.562638) {
              return -0.062050;
            } else {
              return 0.008035;
            }
          } else {
            if (f[25] <= 0.500000) {
              return -0.070834;
            } else {
              return -0.113660;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            return 0.042905;
          } else {
            if (f[49] <= 0.288615) {
              return 0.022009;
            } else {
              return -0.048481;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[59] <= -0.402361) {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.047532;
            } else {
              return 0.024521;
            }
          } else {
            if (f[7] <= 0.000425) {
              return -0.039445;
            } else {
              return 0.043344;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return 0.001526;
            } else {
              return 0.041074;
            }
          } else {
            if (f[54] <= -0.095989) {
              return -0.076257;
            } else {
              return 0.029107;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[0] <= 40.016210) {
            if (f[41] <= -0.000059) {
              return -0.089582;
            } else {
              return 0.007587;
            }
          } else {
            if (f[49] <= -0.231143) {
              return -0.119004;
            } else {
              return -0.077808;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[50] <= 0.134495) {
              return 0.010096;
            } else {
              return -0.067069;
            }
          } else {
            return 0.036505;
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[59] <= -0.402361) {
          if (f[14] <= -0.000247) {
            if (f[15] <= -0.000590) {
              return 0.000273;
            } else {
              return -0.047866;
            }
          } else {
            if (f[55] <= -0.402007) {
              return -0.018065;
            } else {
              return 0.038974;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return 0.001467;
            } else {
              return 0.040978;
            }
          } else {
            if (f[8] <= -0.000605) {
              return -0.075725;
            } else {
              return 0.029978;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[14] <= -0.000305) {
            return -0.115496;
          } else {
            if (f[32] <= 0.021096) {
              return -0.009131;
            } else {
              return -0.084108;
            }
          }
        } else {
          if (f[38] <= 1.140800) {
            if (f[61] <= 0.749567) {
              return -0.060927;
            } else {
              return 0.015881;
            }
          } else {
            if (f[50] <= 0.160534) {
              return 0.036970;
            } else {
              return -0.037933;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[59] <= -0.402361) {
          if (f[25] <= 0.750000) {
            if (f[8] <= -0.001217) {
              return -0.058852;
            } else {
              return 0.018299;
            }
          } else {
            if (f[13] <= -0.000150) {
              return -0.036236;
            } else {
              return 0.043099;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return 0.001410;
            } else {
              return 0.040885;
            }
          } else {
            if (f[8] <= -0.000605) {
              return -0.068633;
            } else {
              return 0.029471;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[9] <= 0.000100) {
            if (f[61] <= 0.532272) {
              return -0.074899;
            } else {
              return 0.006306;
            }
          } else {
            if (f[13] <= -0.000177) {
              return -0.109757;
            } else {
              return -0.068370;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            return 0.042769;
          } else {
            if (f[13] <= -0.000172) {
              return 0.030677;
            } else {
              return -0.042761;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[1] <= -5.512710) {
              return 0.009459;
            } else {
              return 0.041563;
            }
          } else {
            if (f[51] <= -0.020266) {
              return 0.044544;
            } else {
              return -0.049850;
            }
          }
        } else {
          if (f[43] <= 0.008290) {
            if (f[30] <= -0.336543) {
              return 0.002445;
            } else {
              return -0.052826;
            }
          } else {
            if (f[24] <= 0.708333) {
              return 0.009557;
            } else {
              return -0.075568;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[15] <= -0.000015) {
            if (f[14] <= -0.000309) {
              return -0.099974;
            } else {
              return -0.007651;
            }
          } else {
            if (f[56] <= -0.000306) {
              return -0.064138;
            } else {
              return -0.101253;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[61] <= 0.827599) {
              return -0.038735;
            } else {
              return 0.043057;
            }
          } else {
            return 0.035999;
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[59] <= -0.402361) {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.039780;
            } else {
              return 0.024516;
            }
          } else {
            if (f[13] <= -0.000150) {
              return -0.032979;
            } else {
              return 0.043055;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return 0.000163;
            } else {
              return 0.040710;
            }
          } else {
            if (f[8] <= -0.000605) {
              return -0.072680;
            } else {
              return 0.027864;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[21] <= -0.000647) {
            return -0.106657;
          } else {
            if (f[9] <= 0.000097) {
              return 0.016505;
            } else {
              return -0.094033;
            }
          }
        } else {
          if (f[15] <= -0.000589) {
            if (f[20] <= 0.002584) {
              return 0.044034;
            } else {
              return 0.012581;
            }
          } else {
            if (f[61] <= 0.749567) {
              return -0.045936;
            } else {
              return 0.015629;
            }
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[0] <= 48.557049) {
        if (f[43] <= 0.001005) {
          if (f[7] <= -0.000315) {
            return -0.164416;
          } else {
            if (f[0] <= 43.254392) {
              return -0.048649;
            } else {
              return 0.046286;
            }
          }
        } else {
          if (f[57] <= 0.450441) {
            if (f[42] <= 0.000004) {
              return -0.038892;
            } else {
              return 0.019808;
            }
          } else {
            return -0.060264;
          }
        }
      } else {
        if (f[8] <= 0.001077) {
          if (f[41] <= 0.000008) {
            if (f[3] <= 0.000872) {
              return -0.093128;
            } else {
              return 0.000865;
            }
          } else {
            if (f[43] <= 0.011271) {
              return -0.051182;
            } else {
              return 0.044671;
            }
          }
        } else {
          if (f[49] <= -0.351984) {
            return -0.020555;
          } else {
            if (f[45] <= 0.723147) {
              return 0.043251;
            } else {
              return 0.014371;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[9] <= 0.000107) {
        if (f[42] <= 0.000004) {
          if (f[33] <= -5.995498) {
            return -0.110161;
          } else {
            if (f[51] <= 0.117822) {
              return -0.028931;
            } else {
              return 0.046036;
            }
          }
        } else {
          if (f[60] <= 0.701868) {
            if (f[55] <= -0.383109) {
              return -0.002111;
            } else {
              return 0.026618;
            }
          } else {
            return -0.056533;
          }
        }
      } else {
        if (f[51] <= 0.112573) {
          if (f[15] <= -0.000594) {
            if (f[29] <= 1.760558) {
              return 0.042571;
            } else {
              return -0.003847;
            }
          } else {
            if (f[14] <= -0.000299) {
              return -0.042655;
            } else {
              return 0.000347;
            }
          }
        } else {
          if (f[8] <= 0.000390) {
            if (f[41] <= 0.000015) {
              return -0.043973;
            } else {
              return -0.136658;
            }
          } else {
            if (f[10] <= -0.000056) {
              return 0.046364;
            } else {
              return -0.019161;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return 0.011199;
            } else {
              return 0.041383;
            }
          } else {
            if (f[54] <= -0.095989) {
              return -0.063459;
            } else {
              return 0.028641;
            }
          }
        } else {
          if (f[25] <= 0.750000) {
            if (f[24] <= 0.658333) {
              return 0.019057;
            } else {
              return -0.054990;
            }
          } else {
            if (f[13] <= -0.000150) {
              return -0.029903;
            } else {
              return 0.042833;
            }
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[0] <= 40.016210) {
            if (f[7] <= -0.000534) {
              return -0.061454;
            } else {
              return 0.017099;
            }
          } else {
            if (f[49] <= -0.231143) {
              return -0.090288;
            } else {
              return -0.055551;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[61] <= 0.827599) {
              return -0.032993;
            } else {
              return 0.043005;
            }
          } else {
            return 0.035760;
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[59] <= -0.402361) {
          if (f[14] <= -0.000247) {
            if (f[15] <= -0.000590) {
              return 0.002519;
            } else {
              return -0.037989;
            }
          } else {
            if (f[49] <= -0.293024) {
              return -0.016158;
            } else {
              return 0.038552;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[20] <= 0.002582) {
              return 0.004140;
            } else {
              return 0.040497;
            }
          } else {
            if (f[7] <= -0.000245) {
              return -0.047914;
            } else {
              return 0.038973;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[14] <= -0.000305) {
            return -0.094006;
          } else {
            if (f[0] <= 42.687323) {
              return -0.004005;
            } else {
              return -0.083096;
            }
          }
        } else {
          if (f[15] <= -0.000589) {
            if (f[27] <= -2.258653) {
              return 0.044017;
            } else {
              return 0.010602;
            }
          } else {
            if (f[48] <= -0.511686) {
              return -0.120647;
            } else {
              return -0.008116;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[59] <= -0.402361) {
          if (f[14] <= -0.000247) {
            if (f[15] <= -0.000590) {
              return 0.002423;
            } else {
              return -0.035531;
            }
          } else {
            if (f[49] <= -0.293024) {
              return -0.015313;
            } else {
              return 0.038270;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[42] <= 0.000005) {
              return -0.000343;
            } else {
              return 0.040408;
            }
          } else {
            if (f[8] <= -0.000605) {
              return -0.061291;
            } else {
              return 0.027437;
            }
          }
        }
      } else {
        if (f[61] <= 0.532272) {
          if (f[3] <= 0.001411) {
            return -0.044419;
          } else {
            return -0.090820;
          }
        } else {
          if (f[61] <= 0.749567) {
            if (f[0] <= 51.467165) {
              return 0.004255;
            } else {
              return -0.061276;
            }
          } else {
            if (f[37] <= 0.202466) {
              return 0.036104;
            } else {
              return -0.020227;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[61] <= 0.489345) {
        if (f[46] <= 0.116022) {
          if (f[61] <= 0.437620) {
            if (f[42] <= 0.000005) {
              return 0.042295;
            } else {
              return 0.041225;
            }
          } else {
            if (f[51] <= -0.030995) {
              return 0.044873;
            } else {
              return -0.018145;
            }
          }
        } else {
          if (f[8] <= -0.001257) {
            return -0.104178;
          } else {
            if (f[25] <= 0.750000) {
              return 0.018933;
            } else {
              return -0.018773;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[15] <= 0.000333) {
            if (f[61] <= 0.552886) {
              return -0.047725;
            } else {
              return 0.007831;
            }
          } else {
            if (f[54] <= -0.070484) {
              return -0.055808;
            } else {
              return -0.076691;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            if (f[47] <= -0.395554) {
              return 0.044032;
            } else {
              return 0.041953;
            }
          } else {
            if (f[13] <= -0.000172) {
              return 0.030029;
            } else {
              return -0.033621;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[59] <= -0.350222) {
          if (f[21] <= 0.000415) {
            if (f[15] <= 0.000590) {
              return -0.006906;
            } else {
              return -0.078274;
            }
          } else {
            if (f[7] <= 0.000485) {
              return 0.043930;
            } else {
              return 0.042788;
            }
          }
        } else {
          if (f[61] <= 0.433018) {
            if (f[8] <= -0.001288) {
              return 0.006485;
            } else {
              return 0.041245;
            }
          } else {
            if (f[8] <= -0.000565) {
              return -0.046245;
            } else {
              return 0.042652;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[44] <= 0.016661) {
            if (f[14] <= -0.000292) {
              return -0.040307;
            } else {
              return -0.004534;
            }
          } else {
            return -0.072893;
          }
        } else {
          if (f[45] <= 0.505121) {
            if (f[47] <= -0.395554) {
              return 0.043861;
            } else {
              return 0.041873;
            }
          } else {
            if (f[43] <= 0.004262) {
              return -0.073782;
            } else {
              return 0.006942;
            }
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[1] <= -5.512710) {
              return 0.004222;
            } else {
              return 0.041191;
            }
          } else {
            if (f[51] <= -0.020266) {
              return 0.037289;
            } else {
              return -0.042718;
            }
          }
        } else {
          if (f[43] <= 0.008290) {
            if (f[13] <= -0.000176) {
              return -0.005064;
            } else {
              return -0.051903;
            }
          } else {
            if (f[8] <= -0.001249) {
              return -0.092941;
            } else {
              return 0.007772;
            }
          }
        }
      } else {
        if (f[61] <= 0.532272) {
          if (f[1] <= -2.276484) {
            return -0.040439;
          } else {
            return -0.083555;
          }
        } else {
          if (f[39] <= 0.163188) {
            if (f[61] <= 0.703847) {
              return -0.069559;
            } else {
              return 0.003447;
            }
          } else {
            if (f[58] <= -0.342300) {
              return -0.063571;
            } else {
              return 0.008806;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[9] <= 0.000107) {
        if (f[55] <= -0.383109) {
          if (f[43] <= 0.001331) {
            return -0.184376;
          } else {
            if (f[31] <= -1.646540) {
              return -0.034491;
            } else {
              return 0.020565;
            }
          }
        } else {
          if (f[57] <= 0.450441) {
            if (f[21] <= -0.000715) {
              return -0.054150;
            } else {
              return 0.024547;
            }
          } else {
            return -0.044202;
          }
        }
      } else {
        if (f[8] <= 0.001077) {
          if (f[56] <= -0.074430) {
            if (f[44] <= 0.016661) {
              return -0.042144;
            } else {
              return 0.010513;
            }
          } else {
            if (f[55] <= 0.420639) {
              return 0.007085;
            } else {
              return -0.049708;
            }
          }
        } else {
          if (f[49] <= -0.354669) {
            return -0.015005;
          } else {
            if (f[56] <= -0.023293) {
              return 0.043868;
            } else {
              return 0.018396;
            }
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[8] <= -0.001288) {
              return 0.005249;
            } else {
              return 0.041138;
            }
          } else {
            if (f[8] <= -0.000605) {
              return -0.051742;
            } else {
              return 0.025831;
            }
          }
        } else {
          if (f[21] <= 0.000415) {
            if (f[15] <= 0.000590) {
              return -0.005693;
            } else {
              return -0.069144;
            }
          } else {
            return 0.043429;
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[9] <= 0.000100) {
            if (f[41] <= -0.000059) {
              return -0.056359;
            } else {
              return 0.011125;
            }
          } else {
            if (f[27] <= 1.063002) {
              return -0.086432;
            } else {
              return -0.056367;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[37] <= 0.202466) {
              return 0.003347;
            } else {
              return -0.070719;
            }
          } else {
            if (f[44] <= 0.016678) {
              return 0.042958;
            } else {
              return -0.000273;
            }
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[46] <= 0.116022) {
          if (f[61] <= 0.489345) {
            if (f[9] <= 0.000059) {
              return 0.028508;
            } else {
              return 0.041580;
            }
          } else {
            return -0.038382;
          }
        } else {
          if (f[8] <= -0.001257) {
            return -0.088161;
          } else {
            if (f[25] <= 0.750000) {
              return 0.018970;
            } else {
              return -0.016183;
            }
          }
        }
      } else {
        if (f[61] <= 0.552886) {
          if (f[14] <= -0.000305) {
            return -0.080911;
          } else {
            if (f[2] <= 0.324058) {
              return 0.007838;
            } else {
              return -0.073986;
            }
          }
        } else {
          if (f[15] <= -0.000589) {
            if (f[14] <= -0.000312) {
              return 0.003228;
            } else {
              return 0.044713;
            }
          } else {
            if (f[52] <= -0.568946) {
              return -0.097580;
            } else {
              return -0.008454;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[59] <= -0.350222) {
          if (f[14] <= -0.000247) {
            if (f[14] <= -0.000301) {
              return 0.005187;
            } else {
              return -0.027499;
            }
          } else {
            if (f[49] <= -0.293024) {
              return -0.009476;
            } else {
              return 0.038078;
            }
          }
        } else {
          if (f[1] <= -5.512710) {
            if (f[15] <= -0.000590) {
              return 0.041537;
            } else {
              return -0.131313;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.041054;
            } else {
              return 0.003265;
            }
          }
        }
      } else {
        if (f[61] <= 0.749567) {
          if (f[44] <= 0.016661) {
            if (f[3] <= 0.000872) {
              return -0.059294;
            } else {
              return -0.013076;
            }
          } else {
            return -0.065214;
          }
        } else {
          if (f[43] <= 0.007222) {
            if (f[13] <= -0.000172) {
              return 0.042849;
            } else {
              return -0.063847;
            }
          } else {
            if (f[47] <= -0.379880) {
              return 0.044327;
            } else {
              return 0.041891;
            }
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[46] <= 0.116022) {
          if (f[61] <= 0.489345) {
            if (f[61] <= 0.437620) {
              return 0.041010;
            } else {
              return 0.025372;
            }
          } else {
            return -0.035390;
          }
        } else {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.029343;
            } else {
              return 0.026821;
            }
          } else {
            if (f[37] <= -0.358004) {
              return 0.006758;
            } else {
              return -0.027762;
            }
          }
        }
      } else {
        if (f[61] <= 0.562638) {
          if (f[21] <= -0.000649) {
            return -0.074906;
          } else {
            if (f[21] <= -0.000291) {
              return 0.035867;
            } else {
              return -0.060811;
            }
          }
        } else {
          if (f[29] <= 4.059531) {
            if (f[45] <= 0.505121) {
              return 0.032096;
            } else {
              return -0.027690;
            }
          } else {
            if (f[51] <= -0.122165) {
              return -0.052145;
            } else {
              return 0.043272;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[53] <= 0.089935) {
          if (f[1] <= -5.512710) {
            if (f[3] <= 0.001412) {
              return -0.115309;
            } else {
              return 0.041440;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.040987;
            } else {
              return 0.002848;
            }
          }
        } else {
          if (f[61] <= 0.051622) {
            return -0.130005;
          } else {
            if (f[8] <= 0.000963) {
              return -0.009581;
            } else {
              return 0.044046;
            }
          }
        }
      } else {
        if (f[61] <= 0.703847) {
          if (f[20] <= 0.002601) {
            if (f[61] <= 0.568641) {
              return -0.027882;
            } else {
              return 0.005303;
            }
          } else {
            return -0.073400;
          }
        } else {
          if (f[13] <= -0.000172) {
            if (f[47] <= -0.391307) {
              return 0.043894;
            } else {
              return 0.042037;
            }
          } else {
            if (f[49] <= 0.288615) {
              return 0.030655;
            } else {
              return -0.052984;
            }
          }
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[39] <= 0.059889) {
        if (f[56] <= -0.165091) {
          if (f[6] <= -0.000014) {
            if (f[39] <= -0.000000) {
              return -0.028487;
            } else {
              return -0.100306;
            }
          } else {
            return 0.031777;
          }
        } else {
          if (f[3] <= 0.001514) {
            if (f[51] <= 0.060785) {
              return 0.011278;
            } else {
              return 0.046444;
            }
          } else {
            if (f[15] <= 0.000815) {
              return -0.110904;
            } else {
              return -0.019953;
            }
          }
        }
      } else {
        if (f[51] <= 0.121960) {
          if (f[60] <= 0.701868) {
            if (f[15] <= 0.000125) {
              return 0.017547;
            } else {
              return -0.006481;
            }
          } else {
            return -0.039376;
          }
        } else {
          if (f[9] <= 0.000060) {
            return -0.100417;
          } else {
            if (f[41] <= -0.000001) {
              return 0.018969;
            } else {
              return -0.056578;
            }
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[0] <= 48.557049) {
        if (f[43] <= 0.001005) {
          if (f[7] <= -0.000315) {
            return -0.142056;
          } else {
            if (f[48] <= 0.604561) {
              return -0.040453;
            } else {
              return 0.046326;
            }
          }
        } else {
          if (f[1] <= -4.468987) {
            if (f[44] <= 0.016654) {
              return -0.001016;
            } else {
              return -0.128741;
            }
          } else {
            if (f[44] <= 0.017462) {
              return 0.025887;
            } else {
              return -0.053710;
            }
          }
        }
      } else {
        if (f[8] <= 0.001077) {
          if (f[52] <= -0.456555) {
            if (f[2] <= 0.829395) {
              return 0.043092;
            } else {
              return 0.016841;
            }
          } else {
            if (f[6] <= -0.000163) {
              return 0.034887;
            } else {
              return -0.021191;
            }
          }
        } else {
          if (f[49] <= -0.354669) {
            return -0.011235;
          } else {
            if (f[45] <= 0.734697) {
              return 0.042898;
            } else {
              return 0.010865;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[50] <= -0.072403) {
          if (f[21] <= 0.000415) {
            if (f[15] <= 0.000590) {
              return -0.002157;
            } else {
              return -0.054431;
            }
          } else {
            if (f[61] <= 0.391149) {
              return 0.042708;
            } else {
              return 0.050043;
            }
          }
        } else {
          if (f[61] <= 0.489345) {
            if (f[8] <= -0.001092) {
              return 0.028421;
            } else {
              return 0.041546;
            }
          } else {
            return -0.032603;
          }
        }
      } else {
        if (f[61] <= 0.643193) {
          if (f[0] <= 40.016210) {
            if (f[41] <= -0.000059) {
              return -0.048799;
            } else {
              return 0.017486;
            }
          } else {
            if (f[49] <= -0.231143) {
              return -0.074282;
            } else {
              return -0.047078;
            }
          }
        } else {
          if (f[38] <= 0.802618) {
            if (f[38] <= 0.435808) {
              return 0.012869;
            } else {
              return -0.045740;
            }
          } else {
            if (f[45] <= 0.648703) {
              return 0.042841;
            } else {
              return -0.007207;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[53] <= 0.089935) {
          if (f[1] <= -5.512710) {
            if (f[3] <= 0.001410) {
              return -0.111902;
            } else {
              return 0.041361;
            }
          } else {
            if (f[61] <= 0.433018) {
              return 0.040907;
            } else {
              return 0.001522;
            }
          }
        } else {
          if (f[21] <= 0.000415) {
            if (f[15] <= 0.000590) {
              return -0.004186;
            } else {
              return -0.055434;
            }
          } else {
            if (f[7] <= 0.000485) {
              return 0.043726;
            } else {
              return 0.042414;
            }
          }
        }
      } else {
        if (f[61] <= 0.703847) {
          if (f[20] <= 0.002601) {
            if (f[14] <= -0.000292) {
              return -0.030911;
            } else {
              return -0.000767;
            }
          } else {
            return -0.069117;
          }
        } else {
          if (f[13] <= -0.000172) {
            if (f[48] <= -0.324758) {
              return 0.043763;
            } else {
              return 0.041988;
            }
          } else {
            if (f[49] <= 0.288615) {
              return 0.030208;
            } else {
              return -0.048682;
            }
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[51] <= 0.006066) {
          if (f[20] <= 0.002582) {
            return -0.029172;
          } else {
            if (f[46] <= -0.178342) {
              return -0.023582;
            } else {
              return 0.040105;
            }
          }
        } else {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.023474;
            } else {
              return 0.025097;
            }
          } else {
            if (f[19] <= -1.838723) {
              return -0.058129;
            } else {
              return -0.007702;
            }
          }
        }
      } else {
        if (f[61] <= 0.532272) {
          if (f[1] <= -2.276484) {
            return -0.030566;
          } else {
            return -0.069440;
          }
        } else {
          if (f[39] <= 0.163188) {
            if (f[61] <= 0.703847) {
              return -0.057572;
            } else {
              return 0.004842;
            }
          } else {
            if (f[42] <= 0.000127) {
              return -0.014804;
            } else {
              return 0.021026;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[8] <= -0.001288) {
              return 0.001256;
            } else {
              return 0.040877;
            }
          } else {
            if (f[51] <= 0.017667) {
              return 0.043319;
            } else {
              return -0.077153;
            }
          }
        } else {
          if (f[7] <= 0.000425) {
            if (f[9] <= 0.000138) {
              return -0.000898;
            } else {
              return -0.037716;
            }
          } else {
            if (f[38] <= 0.823624) {
              return 0.042888;
            } else {
              return 0.041962;
            }
          }
        }
      } else {
        if (f[61] <= 0.827599) {
          if (f[9] <= 0.000169) {
            if (f[61] <= 0.568641) {
              return -0.027234;
            } else {
              return 0.005965;
            }
          } else {
            return -0.058846;
          }
        } else {
          if (f[38] <= 1.681658) {
            if (f[55] <= 0.400026) {
              return 0.041768;
            } else {
              return 0.043292;
            }
          } else {
            return -0.011480;
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[42] <= 0.000493) {
        if (f[1] <= 0.423206) {
          if (f[9] <= 0.000060) {
            if (f[51] <= 0.122469) {
              return -0.002344;
            } else {
              return -0.103453;
            }
          } else {
            if (f[6] <= -0.000219) {
              return -0.036685;
            } else {
              return 0.013521;
            }
          }
        } else {
          if (f[29] <= 0.052552) {
            if (f[47] <= 0.390533) {
              return 0.008687;
            } else {
              return -0.119735;
            }
          } else {
            if (f[43] <= 0.001502) {
              return 0.032990;
            } else {
              return -0.015200;
            }
          }
        }
      } else {
        if (f[3] <= 0.001150) {
          return 0.045295;
        } else {
          if (f[36] <= 0.355764) {
            if (f[24] <= 0.125000) {
              return 0.043359;
            } else {
              return 0.042115;
            }
          } else {
            return 0.041448;
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[51] <= 0.006066) {
          if (f[44] <= 0.016661) {
            if (f[8] <= -0.001217) {
              return 0.024365;
            } else {
              return 0.041753;
            }
          } else {
            return -0.007152;
          }
        } else {
          if (f[25] <= 0.750000) {
            if (f[20] <= 0.002583) {
              return -0.022276;
            } else {
              return 0.024579;
            }
          } else {
            if (f[14] <= -0.000299) {
              return 0.006323;
            } else {
              return -0.027405;
            }
          }
        }
      } else {
        if (f[61] <= 0.532272) {
          if (f[3] <= 0.001411) {
            return -0.023558;
          } else {
            return -0.064011;
          }
        } else {
          if (f[3] <= 0.003082) {
            if (f[3] <= 0.002203) {
              return -0.002497;
            } else {
              return -0.066263;
            }
          } else {
            if (f[55] <= 0.345720) {
              return 0.041374;
            } else {
              return 0.043494;
            }
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[53] <= 0.089935) {
          if (f[61] <= 0.433018) {
            if (f[8] <= -0.001288) {
              return 0.001066;
            } else {
              return 0.040825;
            }
          } else {
            if (f[8] <= -0.000875) {
              return -0.062352;
            } else {
              return 0.043054;
            }
          }
        } else {
          if (f[1] <= 4.192991) {
            if (f[9] <= 0.000138) {
              return -0.000846;
            } else {
              return -0.033421;
            }
          } else {
            if (f[7] <= 0.000325) {
              return 0.047074;
            } else {
              return 0.042759;
            }
          }
        }
      } else {
        if (f[61] <= 0.827599) {
          if (f[9] <= 0.000169) {
            if (f[61] <= 0.568641) {
              return -0.025596;
            } else {
              return 0.005774;
            }
          } else {
            return -0.055219;
          }
        } else {
          if (f[38] <= 1.681658) {
            if (f[55] <= 0.411764) {
              return 0.041798;
            } else {
              return 0.043311;
            }
          } else {
            return -0.010386;
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[25] <= 0.750000) {
        if (f[32] <= 0.001964) {
          if (f[1] <= -5.639951) {
            return -0.081871;
          } else {
            if (f[46] <= -0.168895) {
              return -0.042034;
            } else {
              return 0.032642;
            }
          }
        } else {
          if (f[31] <= -0.101920) {
            if (f[8] <= -0.000649) {
              return -0.012568;
            } else {
              return 0.023542;
            }
          } else {
            if (f[27] <= 0.684378) {
              return -0.106611;
            } else {
              return -0.009613;
            }
          }
        }
      } else {
        if (f[41] <= -0.000001) {
          if (f[55] <= -0.410900) {
            return -0.066289;
          } else {
            if (f[44] <= 0.016656) {
              return -0.000806;
            } else {
              return 0.038648;
            }
          }
        } else {
          if (f[19] <= -1.976269) {
            return -0.164144;
          } else {
            if (f[43] <= 0.010978) {
              return -0.022625;
            } else {
              return 0.034784;
            }
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[61] <= 0.501038) {
        if (f[51] <= 0.006066) {
          if (f[60] <= -0.372640) {
            return -0.046125;
          } else {
            if (f[46] <= -0.178342) {
              return -0.023649;
            } else {
              return 0.039828;
            }
          }
        } else {
          if (f[13] <= -0.000049) {
            if (f[14] <= -0.000301) {
              return 0.009562;
            } else {
              return -0.015509;
            }
          } else {
            if (f[42] <= 0.000006) {
              return -0.014597;
            } else {
              return 0.043149;
            }
          }
        }
      } else {
        if (f[61] <= 0.552886) {
          if (f[0] <= 40.299911) {
            if (f[6] <= -0.000206) {
              return -0.053669;
            } else {
              return 0.016737;
            }
          } else {
            return -0.064914;
          }
        } else {
          if (f[29] <= 4.059531) {
            if (f[61] <= 0.827599) {
              return -0.023955;
            } else {
              return 0.029370;
            }
          } else {
            if (f[57] <= 0.453057) {
              return 0.043839;
            } else {
              return -0.051076;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[61] <= 0.464453) {
        if (f[53] <= 0.089935) {
          if (f[9] <= 0.000060) {
            if (f[51] <= 0.016204) {
              return 0.040858;
            } else {
              return -0.061003;
            }
          } else {
            if (f[3] <= 0.000922) {
              return 0.021437;
            } else {
              return 0.041067;
            }
          }
        } else {
          if (f[14] <= -0.000247) {
            if (f[10] <= -0.000055) {
              return -0.001849;
            } else {
              return -0.042503;
            }
          } else {
            if (f[49] <= -0.293024) {
              return -0.011099;
            } else {
              return 0.037755;
            }
          }
        }
      } else {
        if (f[61] <= 0.685332) {
          if (f[3] <= 0.001439) {
            if (f[15] <= -0.000166) {
              return 0.003501;
            } else {
              return -0.035296;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.020868;
            } else {
              return -0.061204;
            }
          }
        } else {
          if (f[45] <= 0.505121) {
            return 0.042387;
          } else {
            if (f[25] <= 0.500000) {
              return 0.043340;
            } else {
              return -0.019921;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[42] <= 0.000493) {
        if (f[1] <= 0.423206) {
          if (f[9] <= 0.000060) {
            if (f[51] <= 0.122469) {
              return -0.002738;
            } else {
              return -0.090694;
            }
          } else {
            if (f[10] <= -0.000068) {
              return -0.022701;
            } else {
              return 0.013764;
            }
          }
        } else {
          if (f[39] <= 0.059889) {
            if (f[7] <= 0.000175) {
              return -0.066394;
            } else {
              return -0.006979;
            }
          } else {
            if (f[51] <= 0.116466) {
              return 0.013093;
            } else {
              return -0.032874;
            }
          }
        }
      } else {
        if (f[51] <= 0.109568) {
          if (f[32] <= 0.006460) {
            if (f[20] <= 0.002599) {
              return 0.041939;
            } else {
              return 0.042821;
            }
          } else {
            return 0.041213;
          }
        } else {
          return 0.043920;
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[61] <= 0.433018) {
        if (f[59] <= -0.350222) {
          if (f[21] <= 0.000415) {
            if (f[9] <= 0.000138) {
              return -0.000064;
            } else {
              return -0.033495;
            }
          } else {
            if (f[8] <= 0.001150) {
              return 0.042992;
            } else {
              return 0.041784;
            }
          }
        } else {
          if (f[8] <= -0.001288) {
            if (f[15] <= -0.000590) {
              return 0.041378;
            } else {
              return -0.077005;
            }
          } else {
            if (f[8] <= -0.001273) {
              return 0.041784;
            } else {
              return 0.040726;
            }
          }
        }
      } else {
        if (f[51] <= 0.060785) {
          if (f[51] <= -0.002221) {
            if (f[61] <= 0.501038) {
              return 0.029463;
            } else {
              return -0.011280;
            }
          } else {
            if (f[51] <= 0.013123) {
              return -0.079292;
            } else {
              return -0.021915;
            }
          }
        } else {
          if (f[45] <= 0.414719) {
            return -0.027320;
          } else {
            if (f[1] <= 3.326575) {
              return 0.049009;
            } else {
              return 0.029832;
            }
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[61] <= 0.433018) {
        if (f[59] <= -0.350222) {
          if (f[24] <= 0.708333) {
            if (f[42] <= 0.000213) {
              return 0.012734;
            } else {
              return -0.014013;
            }
          } else {
            return -0.049527;
          }
        } else {
          if (f[42] <= 0.000005) {
            if (f[8] <= -0.001223) {
              return -0.085054;
            } else {
              return 0.041147;
            }
          } else {
            if (f[1] <= -5.520096) {
              return 0.041427;
            } else {
              return 0.040665;
            }
          }
        }
      } else {
        if (f[58] <= 0.303101) {
          if (f[55] <= -0.379303) {
            if (f[47] <= 0.324100) {
              return -0.078557;
            } else {
              return -0.018222;
            }
          } else {
            if (f[55] <= -0.326385) {
              return 0.033383;
            } else {
              return -0.011301;
            }
          }
        } else {
          if (f[45] <= 0.440213) {
            return 0.001507;
          } else {
            if (f[61] <= 0.616225) {
              return 0.049668;
            } else {
              return 0.041785;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[61] <= 0.051622) {
        return -0.085645;
      } else {
        if (f[61] <= 0.433018) {
          if (f[53] <= 0.089935) {
            if (f[8] <= -0.001288) {
              return -0.000050;
            } else {
              return 0.040693;
            }
          } else {
            if (f[8] <= 0.000963) {
              return -0.006088;
            } else {
              return 0.043997;
            }
          }
        } else {
          if (f[51] <= 0.060785) {
            if (f[51] <= -0.002221) {
              return -0.004162;
            } else {
              return -0.037393;
            }
          } else {
            if (f[45] <= 0.414719) {
              return -0.026018;
            } else {
              return 0.041766;
            }
          }
        }
      }
    })(f)
  ];
  const metaSum = metaScores.reduce((a,b) => a+b, 0);
  const metaConf = 1 / (1 + Math.exp(-metaSum));
  
  if (metaConf < 0.60) return {action: "HOLD", confidence: 0, reason: `meta:${metaConf.toFixed(2)}`};
  
  const action = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return {action, confidence, reason: `ML:BOOM1000 prob:${mlProb.toFixed(2)} meta:${metaConf.toFixed(2)}`};
}


// ── ML Model: CRASH1000 ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: 120, Meta trees: 300
function predict_CRASHk(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[1] <= 2.100785) {
          if (f[1] <= -0.261789) {
            if (f[7] <= -0.893444) {
              if (f[14] <= -0.001424) {
                if (f[14] <= -0.001883) {
                  return 0.010225;
                } else {
                  return -0.132831;
                }
              } else {
                if (f[0] <= 25.233281) {
                  return 0.061704;
                } else {
                  return 0.017894;
                }
              }
            } else {
              if (f[9] <= 0.525572) {
                if (f[1] <= -3.543273) {
                  return -0.135772;
                } else {
                  return -0.022056;
                }
              } else {
                return 0.067191;
              }
            }
          } else {
            if (f[10] <= 0.543306) {
              if (f[9] <= 0.544771) {
                if (f[19] <= 0.002587) {
                  return -0.006834;
                } else {
                  return -0.070577;
                }
              } else {
                if (f[6] <= 0.000186) {
                  return -0.160000;
                } else {
                  return -0.112375;
                }
              }
            } else {
              return 0.105494;
            }
          }
        } else {
          if (f[14] <= 0.000178) {
            return -0.059989;
          } else {
            if (f[16] <= 0.477467) {
              return 0.131178;
            } else {
              if (f[16] <= 0.522196) {
                return -0.015191;
              } else {
                return 0.104816;
              }
            }
          }
        }
      } else {
        if (f[6] <= 0.000013) {
          return -0.160000;
        } else {
          return 0.020803;
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[4] <= 0.000170) {
          if (f[4] <= -0.001322) {
            if (f[5] <= -0.001786) {
              if (f[3] <= 0.000293) {
                return 0.027339;
              } else {
                return -0.063637;
              }
            } else {
              return -0.143199;
            }
          } else {
            if (f[8] <= -0.000534) {
              if (f[9] <= 0.508105) {
                if (f[16] <= 0.403379) {
                  return 0.119516;
                } else {
                  return 0.070695;
                }
              } else {
                return 0.017003;
              }
            } else {
              if (f[15] <= -0.000018) {
                return 0.063013;
              } else {
                if (f[9] <= 0.505831) {
                  return -0.128654;
                } else {
                  return -0.002691;
                }
              }
            }
          }
        } else {
          return 0.158866;
        }
      } else {
        if (f[1] <= -0.290214) {
          if (f[4] <= -0.000689) {
            if (f[6] <= 0.000414) {
              return -0.020612;
            } else {
              return -0.158620;
            }
          } else {
            if (f[9] <= 0.523819) {
              if (f[8] <= -0.000919) {
                if (f[15] <= 0.000009) {
                  return -0.015008;
                } else {
                  return -0.155690;
                }
              } else {
                if (f[2] <= 0.002639) {
                  return -0.003819;
                } else {
                  return 0.050464;
                }
              }
            } else {
              if (f[5] <= -0.001480) {
                return -0.060505;
              } else {
                if (f[9] <= 0.532420) {
                  return 0.122647;
                } else {
                  return 0.039210;
                }
              }
            }
          }
        } else {
          if (f[4] <= 0.000304) {
            if (f[17] <= 0.653149) {
              if (f[2] <= 0.001420) {
                if (f[15] <= -0.000001) {
                  return 0.011765;
                } else {
                  return -0.055473;
                }
              } else {
                if (f[9] <= 0.467468) {
                  return -0.010922;
                } else {
                  return -0.130316;
                }
              }
            } else {
              if (f[0] <= 100.000000) {
                return 0.076689;
              } else {
                if (f[1] <= 1.773830) {
                  return 0.025322;
                } else {
                  return -0.124464;
                }
              }
            }
          } else {
            if (f[6] <= 0.000320) {
              if (f[4] <= 0.000325) {
                if (f[5] <= 0.000591) {
                  return -0.053004;
                } else {
                  return 0.024433;
                }
              } else {
                return -0.106375;
              }
            } else {
              if (f[1] <= 0.372365) {
                return -0.156285;
              } else {
                return -0.064230;
              }
            }
          }
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[4] <= 0.000170) {
          if (f[4] <= -0.001322) {
            if (f[5] <= -0.001786) {
              if (f[3] <= 0.000293) {
                return 0.025164;
              } else {
                return -0.058750;
              }
            } else {
              if (f[8] <= -0.000692) {
                return -0.146480;
              } else {
                return -0.099813;
              }
            }
          } else {
            if (f[8] <= -0.000534) {
              if (f[14] <= -0.000641) {
                if (f[9] <= 0.504410) {
                  return 0.069832;
                } else {
                  return -0.046937;
                }
              } else {
                return 0.117642;
              }
            } else {
              if (f[15] <= -0.000018) {
                return 0.058014;
              } else {
                if (f[9] <= 0.505831) {
                  return -0.119070;
                } else {
                  return -0.002475;
                }
              }
            }
          }
        } else {
          return 0.147294;
        }
      } else {
        if (f[8] <= 0.000019) {
          if (f[4] <= -0.000689) {
            if (f[14] <= 0.000185) {
              if (f[0] <= 24.780349) {
                return -0.073304;
              } else {
                return -0.153143;
              }
            } else {
              return -0.014770;
            }
          } else {
            if (f[15] <= 0.000017) {
              if (f[10] <= 0.522078) {
                if (f[5] <= 0.000250) {
                  return 0.013132;
                } else {
                  return 0.069026;
                }
              } else {
                return 0.119918;
              }
            } else {
              if (f[3] <= 0.000306) {
                if (f[3] <= 0.000205) {
                  return 0.004484;
                } else {
                  return -0.137601;
                }
              } else {
                return 0.047261;
              }
            }
          }
        } else {
          if (f[4] <= 0.000304) {
            if (f[17] <= 0.653149) {
              if (f[15] <= -0.000001) {
                if (f[4] <= 0.000288) {
                  return -0.049694;
                } else {
                  return 0.082992;
                }
              } else {
                if (f[15] <= -0.000000) {
                  return -0.110608;
                } else {
                  return -0.049502;
                }
              }
            } else {
              if (f[0] <= 100.000000) {
                return 0.063016;
              } else {
                if (f[8] <= 0.000650) {
                  return -0.104755;
                } else {
                  return 0.029334;
                }
              }
            }
          } else {
            if (f[15] <= 0.000009) {
              if (f[0] <= 47.411345) {
                return 0.107188;
              } else {
                if (f[16] <= 0.203004) {
                  return -0.115424;
                } else {
                  return 0.006881;
                }
              }
            } else {
              return -0.104956;
            }
          }
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[14] <= 0.000039) {
          if (f[9] <= 0.545908) {
            if (f[6] <= 0.000244) {
              if (f[17] <= 0.551303) {
                return -0.148330;
              } else {
                return -0.072467;
              }
            } else {
              if (f[14] <= -0.001448) {
                if (f[14] <= -0.002217) {
                  return 0.018885;
                } else {
                  return -0.126556;
                }
              } else {
                if (f[15] <= -0.000032) {
                  return 0.102095;
                } else {
                  return -0.011775;
                }
              }
            }
          } else {
            return 0.091294;
          }
        } else {
          if (f[19] <= 0.002596) {
            if (f[15] <= -0.000011) {
              if (f[5] <= 0.000599) {
                return 0.139844;
              } else {
                return 0.137254;
              }
            } else {
              return 0.128895;
            }
          } else {
            if (f[15] <= -0.000013) {
              return 0.090366;
            } else {
              return -0.013257;
            }
          }
        }
      } else {
        if (f[1] <= -0.290214) {
          if (f[17] <= 0.723516) {
            if (f[19] <= 0.002633) {
              if (f[6] <= 0.000773) {
                if (f[15] <= 0.000018) {
                  return 0.017614;
                } else {
                  return -0.127491;
                }
              } else {
                return 0.087850;
              }
            } else {
              return -0.095391;
            }
          } else {
            return -0.105684;
          }
        } else {
          if (f[19] <= 0.002587) {
            if (f[7] <= -0.953084) {
              if (f[17] <= 0.549629) {
                if (f[5] <= 0.000611) {
                  return -0.056114;
                } else {
                  return 0.007007;
                }
              } else {
                if (f[2] <= 0.001396) {
                  return 0.015436;
                } else {
                  return -0.023672;
                }
              }
            } else {
              return 0.098939;
            }
          } else {
            if (f[5] <= -0.000229) {
              return -0.037776;
            } else {
              if (f[18] <= 0.035000) {
                if (f[6] <= 0.000337) {
                  return -0.150139;
                } else {
                  return -0.140976;
                }
              } else {
                return -0.064287;
              }
            }
          }
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000132) {
          if (f[4] <= -0.001322) {
            if (f[4] <= -0.002047) {
              return 0.009957;
            } else {
              if (f[3] <= 0.000313) {
                return -0.128822;
              } else {
                return -0.004091;
              }
            }
          } else {
            if (f[8] <= -0.000561) {
              if (f[9] <= 0.508105) {
                if (f[16] <= 0.403379) {
                  return 0.116799;
                } else {
                  return 0.054159;
                }
              } else {
                if (f[4] <= -0.000949) {
                  return -0.046421;
                } else {
                  return 0.028362;
                }
              }
            } else {
              if (f[10] <= 0.510867) {
                if (f[15] <= -0.000018) {
                  return 0.049997;
                } else {
                  return -0.057478;
                }
              } else {
                return 0.069716;
              }
            }
          }
        } else {
          if (f[15] <= -0.000004) {
            return 0.131309;
          } else {
            if (f[8] <= 0.000533) {
              return 0.089422;
            } else {
              if (f[2] <= 0.001422) {
                return 0.046703;
              } else {
                return -0.081267;
              }
            }
          }
        }
      } else {
        if (f[7] <= -0.976734) {
          if (f[10] <= 0.529289) {
            if (f[9] <= 0.461165) {
              return -0.150027;
            } else {
              if (f[9] <= 0.478745) {
                if (f[5] <= 0.000595) {
                  return 0.047812;
                } else {
                  return -0.088614;
                }
              } else {
                if (f[6] <= 0.000016) {
                  return 0.001047;
                } else {
                  return -0.082148;
                }
              }
            }
          } else {
            return 0.075846;
          }
        } else {
          if (f[2] <= 0.001044) {
            if (f[9] <= 0.505150) {
              if (f[17] <= 0.537222) {
                if (f[6] <= 0.000154) {
                  return -0.149057;
                } else {
                  return -0.000028;
                }
              } else {
                if (f[16] <= 0.224645) {
                  return -0.041187;
                } else {
                  return 0.074091;
                }
              }
            } else {
              if (f[5] <= 0.000398) {
                return -0.137902;
              } else {
                if (f[16] <= 0.176078) {
                  return 0.036384;
                } else {
                  return -0.088176;
                }
              }
            }
          } else {
            if (f[5] <= 0.000632) {
              if (f[4] <= -0.000576) {
                return -0.095559;
              } else {
                if (f[16] <= 0.253634) {
                  return 0.032204;
                } else {
                  return 0.001285;
                }
              }
            } else {
              return -0.090702;
            }
          }
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[14] <= 0.000039) {
          if (f[9] <= 0.545908) {
            if (f[6] <= 0.000259) {
              if (f[17] <= 0.519215) {
                if (f[9] <= 0.498364) {
                  return -0.137551;
                } else {
                  return -0.147028;
                }
              } else {
                if (f[16] <= 0.361111) {
                  return -0.082117;
                } else {
                  return 0.011225;
                }
              }
            } else {
              if (f[14] <= -0.001448) {
                if (f[14] <= -0.001992) {
                  return -0.002036;
                } else {
                  return -0.128366;
                }
              } else {
                if (f[15] <= -0.000032) {
                  return 0.097167;
                } else {
                  return -0.013732;
                }
              }
            }
          } else {
            return 0.078699;
          }
        } else {
          if (f[5] <= 0.000263) {
            if (f[15] <= -0.000018) {
              return 0.126198;
            } else {
              if (f[19] <= 0.002604) {
                if (f[5] <= -0.000218) {
                  return 0.080952;
                } else {
                  return -0.051618;
                }
              } else {
                if (f[14] <= 0.000189) {
                  return -0.091787;
                } else {
                  return 0.060559;
                }
              }
            }
          } else {
            if (f[15] <= -0.000002) {
              if (f[1] <= 1.783283) {
                if (f[19] <= 0.002583) {
                  return 0.120033;
                } else {
                  return 0.133230;
                }
              } else {
                return 0.101980;
              }
            } else {
              if (f[0] <= 100.000000) {
                return 0.051350;
              } else {
                return -0.015979;
              }
            }
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          if (f[9] <= 0.543757) {
            if (f[16] <= 0.367773) {
              return -0.145504;
            } else {
              if (f[14] <= 0.000170) {
                if (f[16] <= 0.526867) {
                  return -0.044884;
                } else {
                  return 0.097193;
                }
              } else {
                if (f[8] <= 0.000652) {
                  return -0.079625;
                } else {
                  return 0.001313;
                }
              }
            }
          } else {
            return 0.054943;
          }
        } else {
          if (f[6] <= 0.000773) {
            if (f[15] <= 0.000019) {
              if (f[19] <= 0.002595) {
                if (f[9] <= 0.475251) {
                  return 0.022467;
                } else {
                  return -0.023254;
                }
              } else {
                if (f[8] <= -0.000883) {
                  return -0.053062;
                } else {
                  return 0.037815;
                }
              }
            } else {
              return -0.142935;
            }
          } else {
            return 0.059426;
          }
        }
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[14] <= 0.000039) {
          if (f[9] <= 0.545908) {
            if (f[6] <= 0.000244) {
              if (f[15] <= -0.000012) {
                return -0.060253;
              } else {
                return -0.129359;
              }
            } else {
              if (f[14] <= -0.001448) {
                if (f[14] <= -0.002217) {
                  return 0.016739;
                } else {
                  return -0.109276;
                }
              } else {
                if (f[15] <= -0.000035) {
                  return 0.098451;
                } else {
                  return -0.008233;
                }
              }
            }
          } else {
            return 0.076883;
          }
        } else {
          if (f[19] <= 0.002596) {
            if (f[15] <= -0.000010) {
              if (f[5] <= 0.000591) {
                return 0.121163;
              } else {
                return 0.119247;
              }
            } else {
              return 0.109950;
            }
          } else {
            if (f[3] <= 0.000224) {
              return -0.018498;
            } else {
              return 0.068872;
            }
          }
        }
      } else {
        if (f[8] <= 0.000019) {
          if (f[0] <= 44.715195) {
            if (f[9] <= 0.456506) {
              if (f[6] <= 0.000598) {
                return -0.162447;
              } else {
                return -0.048526;
              }
            } else {
              if (f[10] <= 0.522078) {
                if (f[8] <= -0.000919) {
                  return -0.070791;
                } else {
                  return 0.010747;
                }
              } else {
                return 0.103213;
              }
            }
          } else {
            if (f[0] <= 45.914870) {
              return 0.136898;
            } else {
              if (f[14] <= 0.000184) {
                if (f[9] <= 0.508105) {
                  return 0.037915;
                } else {
                  return 0.110926;
                }
              } else {
                return -0.061749;
              }
            }
          }
        } else {
          if (f[15] <= 0.000009) {
            if (f[3] <= 0.000123) {
              if (f[17] <= 0.549629) {
                if (f[0] <= 100.000000) {
                  return -0.062357;
                } else {
                  return 0.000086;
                }
              } else {
                if (f[0] <= 100.000000) {
                  return 0.030342;
                } else {
                  return -0.016011;
                }
              }
            } else {
              return 0.062486;
            }
          } else {
            if (f[9] <= 0.524033) {
              if (f[14] <= 0.000185) {
                if (f[15] <= 0.000011) {
                  return -0.145021;
                } else {
                  return -0.154735;
                }
              } else {
                return -0.099782;
              }
            } else {
              return 0.004544;
            }
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[4] <= -0.001322) {
            if (f[6] <= 0.000467) {
              return -0.117825;
            } else {
              if (f[4] <= -0.001811) {
                if (f[0] <= 18.493723) {
                  return -0.027375;
                } else {
                  return 0.061229;
                }
              } else {
                return -0.097183;
              }
            }
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000525) {
                if (f[0] <= 36.377005) {
                  return 0.069197;
                } else {
                  return -0.037645;
                }
              } else {
                return 0.126715;
              }
            } else {
              if (f[1] <= -1.962861) {
                if (f[4] <= -0.000689) {
                  return -0.026160;
                } else {
                  return 0.115641;
                }
              } else {
                if (f[18] <= 0.008333) {
                  return -0.079630;
                } else {
                  return -0.002644;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000005) {
            return 0.116935;
          } else {
            if (f[3] <= 0.000059) {
              return 0.129461;
            } else {
              return 0.037776;
            }
          }
        }
      } else {
        if (f[2] <= 0.002465) {
          if (f[19] <= 0.002601) {
            if (f[4] <= 0.000304) {
              if (f[17] <= 0.653149) {
                if (f[1] <= 1.021690) {
                  return -0.014505;
                } else {
                  return -0.060008;
                }
              } else {
                if (f[9] <= 0.478975) {
                  return 0.070548;
                } else {
                  return -0.020756;
                }
              }
            } else {
              if (f[15] <= 0.000010) {
                if (f[1] <= -0.324480) {
                  return 0.072508;
                } else {
                  return 0.000625;
                }
              } else {
                return -0.084818;
              }
            }
          } else {
            return -0.163271;
          }
        } else {
          if (f[8] <= -0.000837) {
            if (f[9] <= 0.534184) {
              if (f[4] <= 0.000288) {
                if (f[17] <= 0.514890) {
                  return 0.026762;
                } else {
                  return -0.071402;
                }
              } else {
                return -0.142091;
              }
            } else {
              return 0.090084;
            }
          } else {
            if (f[15] <= 0.000017) {
              if (f[19] <= 0.002596) {
                return 0.006264;
              } else {
                if (f[8] <= -0.000435) {
                  return 0.039845;
                } else {
                  return 0.103174;
                }
              }
            } else {
              if (f[6] <= 0.000773) {
                return -0.069640;
              } else {
                return 0.064133;
              }
            }
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[4] <= -0.001322) {
            if (f[6] <= 0.000467) {
              return -0.111895;
            } else {
              if (f[4] <= -0.001811) {
                if (f[0] <= 18.493723) {
                  return -0.025239;
                } else {
                  return 0.056573;
                }
              } else {
                return -0.091875;
              }
            }
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000525) {
                if (f[2] <= 0.001561) {
                  return -0.016811;
                } else {
                  return 0.080015;
                }
              } else {
                return 0.121339;
              }
            } else {
              if (f[1] <= -1.962861) {
                if (f[4] <= -0.000689) {
                  return -0.024047;
                } else {
                  return 0.108228;
                }
              } else {
                if (f[10] <= 0.510867) {
                  return -0.037044;
                } else {
                  return 0.063720;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000005) {
            return 0.112892;
          } else {
            if (f[3] <= 0.000059) {
              return 0.120591;
            } else {
              return 0.034844;
            }
          }
        }
      } else {
        if (f[2] <= 0.002465) {
          if (f[19] <= 0.002601) {
            if (f[4] <= 0.000304) {
              if (f[8] <= 0.000073) {
                if (f[8] <= -0.000216) {
                  return -0.046217;
                } else {
                  return 0.019553;
                }
              } else {
                if (f[2] <= 0.001420) {
                  return -0.024221;
                } else {
                  return -0.066430;
                }
              }
            } else {
              if (f[15] <= 0.000009) {
                if (f[0] <= 45.914870) {
                  return 0.089021;
                } else {
                  return 0.002174;
                }
              } else {
                return -0.061739;
              }
            }
          } else {
            return -0.150819;
          }
        } else {
          if (f[8] <= -0.000837) {
            if (f[11] <= -2.775416) {
              if (f[2] <= 0.004902) {
                if (f[18] <= 0.018333) {
                  return -0.060308;
                } else {
                  return 0.042143;
                }
              } else {
                return -0.128932;
              }
            } else {
              return 0.052700;
            }
          } else {
            if (f[15] <= 0.000017) {
              if (f[1] <= -2.126762) {
                return 0.075576;
              } else {
                if (f[2] <= 0.003056) {
                  return -0.025950;
                } else {
                  return 0.080329;
                }
              }
            } else {
              if (f[6] <= 0.000773) {
                return -0.064385;
              } else {
                return 0.059494;
              }
            }
          }
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[4] <= 0.000170) {
          if (f[17] <= 0.593675) {
            if (f[10] <= 0.514189) {
              if (f[4] <= -0.001177) {
                if (f[2] <= 0.003952) {
                  return -0.095171;
                } else {
                  return 0.004070;
                }
              } else {
                if (f[6] <= 0.000259) {
                  return -0.087554;
                } else {
                  return 0.040354;
                }
              }
            } else {
              return 0.066774;
            }
          } else {
            if (f[6] <= 0.000372) {
              if (f[1] <= 0.235335) {
                return -0.084960;
              } else {
                return 0.021632;
              }
            } else {
              if (f[8] <= -0.001003) {
                return -0.006699;
              } else {
                return 0.094288;
              }
            }
          }
        } else {
          if (f[15] <= -0.000015) {
            return 0.107771;
          } else {
            return 0.110294;
          }
        }
      } else {
        if (f[16] <= 0.575630) {
          if (f[1] <= 2.106870) {
            if (f[1] <= -0.324480) {
              if (f[4] <= -0.000689) {
                if (f[6] <= 0.000414) {
                  return -0.004619;
                } else {
                  return -0.127006;
                }
              } else {
                if (f[16] <= 0.253634) {
                  return 0.033273;
                } else {
                  return -0.002640;
                }
              }
            } else {
              if (f[9] <= 0.481100) {
                if (f[5] <= 0.000263) {
                  return -0.074388;
                } else {
                  return 0.021565;
                }
              } else {
                if (f[2] <= 0.001442) {
                  return -0.021687;
                } else {
                  return -0.077650;
                }
              }
            }
          } else {
            if (f[15] <= -0.000000) {
              if (f[5] <= 0.000615) {
                return -0.053350;
              } else {
                return 0.077879;
              }
            } else {
              return 0.094250;
            }
          }
        } else {
          if (f[6] <= 0.000012) {
            if (f[4] <= 0.000304) {
              return -0.129321;
            } else {
              return -0.142895;
            }
          } else {
            return -0.006611;
          }
        }
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[1] <= 2.100785) {
          if (f[5] <= -0.002602) {
            if (f[6] <= 0.000626) {
              return -0.004843;
            } else {
              return -0.132143;
            }
          } else {
            if (f[2] <= 0.002465) {
              if (f[5] <= -0.001025) {
                if (f[9] <= 0.481100) {
                  return -0.029037;
                } else {
                  return -0.115972;
                }
              } else {
                if (f[5] <= -0.000327) {
                  return 0.023294;
                } else {
                  return -0.007220;
                }
              }
            } else {
              if (f[5] <= -0.002248) {
                return 0.087997;
              } else {
                if (f[4] <= -0.000655) {
                  return -0.054383;
                } else {
                  return 0.031533;
                }
              }
            }
          }
        } else {
          if (f[14] <= 0.000179) {
            return -0.030302;
          } else {
            if (f[16] <= 0.477467) {
              return 0.115252;
            } else {
              if (f[7] <= -0.976635) {
                return 0.100362;
              } else {
                return 0.021457;
              }
            }
          }
        }
      } else {
        if (f[6] <= 0.000013) {
          if (f[4] <= 0.000304) {
            return -0.123748;
          } else {
            return -0.136135;
          }
        } else {
          return 0.030031;
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[16] <= 0.114629) {
            return 0.065417;
          } else {
            if (f[17] <= 0.588303) {
              if (f[19] <= 0.002609) {
                if (f[6] <= 0.000467) {
                  return -0.025735;
                } else {
                  return 0.064527;
                }
              } else {
                if (f[19] <= 0.002666) {
                  return -0.102129;
                } else {
                  return 0.003121;
                }
              }
            } else {
              if (f[16] <= 0.376464) {
                if (f[14] <= 0.000175) {
                  return -0.060078;
                } else {
                  return 0.048980;
                }
              } else {
                if (f[8] <= -0.001059) {
                  return -0.019323;
                } else {
                  return 0.072089;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000005) {
            return 0.106458;
          } else {
            if (f[7] <= -0.976993) {
              return 0.113710;
            } else {
              return 0.033782;
            }
          }
        }
      } else {
        if (f[7] <= -0.976734) {
          if (f[10] <= 0.529289) {
            if (f[4] <= 0.000280) {
              return 0.031932;
            } else {
              if (f[4] <= 0.000295) {
                if (f[14] <= 0.000170) {
                  return -0.019109;
                } else {
                  return -0.103333;
                }
              } else {
                if (f[5] <= 0.000590) {
                  return 0.018458;
                } else {
                  return -0.054716;
                }
              }
            }
          } else {
            return 0.078144;
          }
        } else {
          if (f[2] <= 0.001044) {
            if (f[16] <= 0.203004) {
              if (f[5] <= 0.000398) {
                if (f[15] <= 0.000002) {
                  return -0.063581;
                } else {
                  return -0.141933;
                }
              } else {
                return -0.012008;
              }
            } else {
              if (f[6] <= 0.000129) {
                if (f[17] <= 0.549629) {
                  return -0.133078;
                } else {
                  return 0.038339;
                }
              } else {
                if (f[2] <= 0.000949) {
                  return 0.058182;
                } else {
                  return -0.036477;
                }
              }
            }
          } else {
            if (f[4] <= 0.000322) {
              if (f[2] <= 0.001421) {
                if (f[5] <= 0.000589) {
                  return -0.035670;
                } else {
                  return 0.062361;
                }
              } else {
                if (f[7] <= -0.976477) {
                  return -0.045268;
                } else {
                  return 0.006137;
                }
              }
            } else {
              if (f[5] <= 0.000622) {
                return -0.011162;
              } else {
                return -0.146788;
              }
            }
          }
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[15] <= -0.000002) {
        if (f[5] <= 0.000209) {
          if (f[16] <= 0.114629) {
            return 0.062893;
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000580) {
                if (f[17] <= 0.533005) {
                  return -0.045486;
                } else {
                  return 0.015783;
                }
              } else {
                return 0.100532;
              }
            } else {
              if (f[16] <= 0.176078) {
                if (f[0] <= 48.805318) {
                  return -0.142664;
                } else {
                  return -0.086511;
                }
              } else {
                if (f[14] <= 0.000190) {
                  return -0.028937;
                } else {
                  return 0.075127;
                }
              }
            }
          }
        } else {
          if (f[14] <= 0.000161) {
            return 0.017459;
          } else {
            if (f[1] <= 1.466459) {
              return 0.110784;
            } else {
              return 0.085937;
            }
          }
        }
      } else {
        if (f[2] <= 0.002639) {
          if (f[16] <= 0.575630) {
            if (f[1] <= 2.100785) {
              if (f[9] <= 0.484861) {
                if (f[0] <= 44.410260) {
                  return -0.075401;
                } else {
                  return 0.016549;
                }
              } else {
                if (f[9] <= 0.515426) {
                  return -0.039795;
                } else {
                  return -0.004185;
                }
              }
            } else {
              if (f[15] <= -0.000000) {
                if (f[19] <= 0.002582) {
                  return -0.055297;
                } else {
                  return 0.071687;
                }
              } else {
                return 0.081829;
              }
            }
          } else {
            if (f[1] <= 2.091688) {
              return 0.009981;
            } else {
              if (f[8] <= 0.000652) {
                return -0.117237;
              } else {
                return -0.127706;
              }
            }
          }
        } else {
          if (f[8] <= -0.000393) {
            if (f[17] <= 0.526700) {
              if (f[17] <= 0.466768) {
                return -0.022434;
              } else {
                if (f[6] <= 0.000433) {
                  return 0.129074;
                } else {
                  return 0.035409;
                }
              }
            } else {
              if (f[0] <= 23.366570) {
                if (f[6] <= 0.000572) {
                  return -0.158108;
                } else {
                  return -0.045807;
                }
              } else {
                if (f[16] <= 0.359753) {
                  return -0.012549;
                } else {
                  return 0.070627;
                }
              }
            }
          } else {
            if (f[19] <= 0.002598) {
              return 0.011289;
            } else {
              return 0.106869;
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[10] <= 0.509494) {
            if (f[9] <= 0.517595) {
              if (f[7] <= -0.890787) {
                if (f[1] <= -2.020555) {
                  return 0.048831;
                } else {
                  return -0.009726;
                }
              } else {
                return -0.104480;
              }
            } else {
              if (f[0] <= 35.801367) {
                if (f[5] <= -0.000974) {
                  return -0.082984;
                } else {
                  return 0.059161;
                }
              } else {
                return -0.123631;
              }
            }
          } else {
            return 0.051926;
          }
        } else {
          if (f[15] <= -0.000005) {
            if (f[15] <= -0.000012) {
              return 0.100373;
            } else {
              return 0.103871;
            }
          } else {
            if (f[7] <= -0.976993) {
              return 0.106534;
            } else {
              return 0.030525;
            }
          }
        }
      } else {
        if (f[7] <= -0.976734) {
          if (f[9] <= 0.461165) {
            if (f[4] <= 0.000300) {
              return -0.126778;
            } else {
              return -0.139085;
            }
          } else {
            if (f[5] <= 0.000590) {
              if (f[9] <= 0.478745) {
                return 0.052493;
              } else {
                if (f[6] <= 0.000015) {
                  return 0.064779;
                } else {
                  return -0.036044;
                }
              }
            } else {
              if (f[8] <= 0.000644) {
                if (f[2] <= 0.001195) {
                  return 0.009226;
                } else {
                  return -0.120735;
                }
              } else {
                if (f[15] <= 0.000000) {
                  return 0.061091;
                } else {
                  return -0.060262;
                }
              }
            }
          }
        } else {
          if (f[2] <= 0.001065) {
            if (f[9] <= 0.505150) {
              if (f[17] <= 0.537222) {
                if (f[1] <= 0.923667) {
                  return 0.006607;
                } else {
                  return -0.127273;
                }
              } else {
                if (f[1] <= 0.704760) {
                  return -0.012638;
                } else {
                  return 0.083138;
                }
              }
            } else {
              if (f[8] <= 0.000510) {
                if (f[16] <= 0.176078) {
                  return -0.053769;
                } else {
                  return -0.134726;
                }
              } else {
                return 0.020554;
              }
            }
          } else {
            if (f[5] <= 0.000632) {
              if (f[4] <= -0.000576) {
                return -0.076487;
              } else {
                if (f[0] <= 100.000000) {
                  return 0.006119;
                } else {
                  return 0.049545;
                }
              }
            } else {
              return -0.117596;
            }
          }
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[15] <= -0.000002) {
        if (f[4] <= 0.000132) {
          if (f[10] <= 0.509494) {
            if (f[6] <= 0.000259) {
              if (f[14] <= 0.000169) {
                return -0.081224;
              } else {
                return 0.019539;
              }
            } else {
              if (f[4] <= -0.001322) {
                if (f[6] <= 0.000467) {
                  return -0.111899;
                } else {
                  return -0.010200;
                }
              } else {
                if (f[8] <= -0.001003) {
                  return -0.044557;
                } else {
                  return 0.036407;
                }
              }
            }
          } else {
            return 0.050727;
          }
        } else {
          return 0.091109;
        }
      } else {
        if (f[2] <= 0.002639) {
          if (f[4] <= 0.000304) {
            if (f[17] <= 0.653149) {
              if (f[8] <= 0.000649) {
                if (f[3] <= 0.000181) {
                  return -0.017178;
                } else {
                  return -0.121803;
                }
              } else {
                if (f[0] <= 100.000000) {
                  return 0.027977;
                } else {
                  return -0.094190;
                }
              }
            } else {
              if (f[16] <= 0.414619) {
                if (f[18] <= 0.021667) {
                  return 0.025739;
                } else {
                  return -0.096870;
                }
              } else {
                if (f[6] <= 0.000027) {
                  return -0.019968;
                } else {
                  return 0.091702;
                }
              }
            }
          } else {
            if (f[15] <= 0.000009) {
              if (f[16] <= 0.481917) {
                if (f[19] <= 0.002583) {
                  return 0.099348;
                } else {
                  return 0.009978;
                }
              } else {
                if (f[19] <= 0.002583) {
                  return -0.006110;
                } else {
                  return -0.150557;
                }
              }
            } else {
              if (f[18] <= 0.011667) {
                return 0.000940;
              } else {
                return -0.088140;
              }
            }
          }
        } else {
          if (f[8] <= -0.000393) {
            if (f[17] <= 0.526700) {
              if (f[17] <= 0.466768) {
                return -0.020163;
              } else {
                if (f[6] <= 0.000433) {
                  return 0.121552;
                } else {
                  return 0.032501;
                }
              }
            } else {
              if (f[0] <= 23.366570) {
                if (f[15] <= 0.000014) {
                  return -0.144354;
                } else {
                  return -0.037420;
                }
              } else {
                if (f[16] <= 0.364023) {
                  return -0.014367;
                } else {
                  return 0.071391;
                }
              }
            }
          } else {
            if (f[19] <= 0.002596) {
              return 0.003671;
            } else {
              return 0.095851;
            }
          }
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[14] <= 0.000039) {
          if (f[15] <= -0.000026) {
            if (f[14] <= -0.001381) {
              if (f[14] <= -0.001883) {
                return 0.013998;
              } else {
                return -0.071127;
              }
            } else {
              return 0.070771;
            }
          } else {
            if (f[16] <= 0.122388) {
              return 0.048947;
            } else {
              if (f[1] <= -0.600077) {
                if (f[8] <= -0.000984) {
                  return -0.085324;
                } else {
                  return 0.031195;
                }
              } else {
                if (f[6] <= 0.000248) {
                  return -0.071355;
                } else {
                  return -0.144013;
                }
              }
            }
          }
        } else {
          if (f[19] <= 0.002596) {
            if (f[15] <= -0.000009) {
              if (f[8] <= 0.000637) {
                return 0.099963;
              } else {
                return 0.096698;
              }
            } else {
              return 0.086611;
            }
          } else {
            if (f[15] <= -0.000014) {
              return 0.070627;
            } else {
              if (f[3] <= 0.000217) {
                return -0.054564;
              } else {
                return 0.038399;
              }
            }
          }
        }
      } else {
        if (f[16] <= 0.575630) {
          if (f[1] <= 2.106870) {
            if (f[1] <= -0.290214) {
              if (f[17] <= 0.723516) {
                if (f[16] <= 0.253634) {
                  return 0.030852;
                } else {
                  return -0.006411;
                }
              } else {
                return -0.093647;
              }
            } else {
              if (f[19] <= 0.002587) {
                if (f[3] <= 0.000122) {
                  return -0.012651;
                } else {
                  return 0.098442;
                }
              } else {
                if (f[17] <= 0.480282) {
                  return -0.018882;
                } else {
                  return -0.100784;
                }
              }
            }
          } else {
            if (f[18] <= 0.155000) {
              return 0.074009;
            } else {
              if (f[14] <= 0.000185) {
                return -0.033227;
              } else {
                return 0.016977;
              }
            }
          }
        } else {
          if (f[15] <= 0.000000) {
            if (f[19] <= 0.002582) {
              return -0.113759;
            } else {
              return -0.122507;
            }
          } else {
            return 0.016243;
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[16] <= 0.114629) {
            return 0.054752;
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000580) {
                if (f[4] <= -0.001322) {
                  return -0.028671;
                } else {
                  return 0.024267;
                }
              } else {
                return 0.093505;
              }
            } else {
              if (f[16] <= 0.176078) {
                return -0.107416;
              } else {
                if (f[14] <= 0.000190) {
                  return -0.024677;
                } else {
                  return 0.061157;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000005) {
            return 0.096634;
          } else {
            if (f[7] <= -0.976993) {
              return 0.101301;
            } else {
              return 0.026868;
            }
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          if (f[9] <= 0.543757) {
            if (f[16] <= 0.423200) {
              if (f[2] <= 0.001380) {
                if (f[9] <= 0.514437) {
                  return -0.095133;
                } else {
                  return 0.048241;
                }
              } else {
                return -0.115773;
              }
            } else {
              if (f[18] <= 0.048333) {
                return 0.061843;
              } else {
                if (f[15] <= 0.000000) {
                  return 0.010821;
                } else {
                  return -0.109979;
                }
              }
            }
          } else {
            return 0.060149;
          }
        } else {
          if (f[2] <= 0.001044) {
            if (f[9] <= 0.505150) {
              if (f[17] <= 0.537222) {
                if (f[6] <= 0.000154) {
                  return -0.119930;
                } else {
                  return 0.010274;
                }
              } else {
                if (f[4] <= 0.000302) {
                  return 0.005783;
                } else {
                  return 0.071588;
                }
              }
            } else {
              if (f[5] <= 0.000398) {
                if (f[15] <= 0.000002) {
                  return -0.075844;
                } else {
                  return -0.128415;
                }
              } else {
                if (f[5] <= 0.000593) {
                  return 0.031000;
                } else {
                  return -0.071786;
                }
              }
            }
          } else {
            if (f[4] <= 0.000322) {
              if (f[9] <= 0.523819) {
                if (f[8] <= -0.000919) {
                  return -0.080853;
                } else {
                  return 0.004880;
                }
              } else {
                if (f[17] <= 0.603244) {
                  return 0.046995;
                } else {
                  return -0.050273;
                }
              }
            } else {
              if (f[5] <= 0.000622) {
                return -0.012197;
              } else {
                return -0.135796;
              }
            }
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[15] <= -0.000018) {
          if (f[14] <= -0.000580) {
            if (f[15] <= -0.000026) {
              if (f[4] <= -0.001322) {
                if (f[3] <= 0.000270) {
                  return -0.056511;
                } else {
                  return 0.036863;
                }
              } else {
                return 0.061592;
              }
            } else {
              if (f[15] <= -0.000021) {
                return -0.105945;
              } else {
                return 0.017761;
              }
            }
          } else {
            if (f[17] <= 0.551303) {
              return 0.085772;
            } else {
              return 0.100772;
            }
          }
        } else {
          if (f[4] <= -0.000689) {
            if (f[16] <= 0.359753) {
              if (f[17] <= 0.656105) {
                if (f[4] <= -0.001278) {
                  return -0.112572;
                } else {
                  return -0.130374;
                }
              } else {
                return -0.008253;
              }
            } else {
              if (f[8] <= -0.001003) {
                if (f[1] <= -4.767344) {
                  return -0.031827;
                } else {
                  return -0.130821;
                }
              } else {
                if (f[0] <= 25.233281) {
                  return 0.081017;
                } else {
                  return -0.025847;
                }
              }
            }
          } else {
            if (f[15] <= -0.000002) {
              if (f[14] <= 0.000039) {
                if (f[1] <= -1.847048) {
                  return 0.086580;
                } else {
                  return -0.053680;
                }
              } else {
                if (f[4] <= -0.000041) {
                  return 0.021355;
                } else {
                  return 0.083941;
                }
              }
            } else {
              if (f[6] <= 0.000018) {
                if (f[18] <= 0.151667) {
                  return 0.055350;
                } else {
                  return -0.017847;
                }
              } else {
                if (f[19] <= 0.002595) {
                  return -0.013398;
                } else {
                  return 0.017610;
                }
              }
            }
          }
        }
      } else {
        if (f[6] <= 0.000013) {
          if (f[4] <= 0.000304) {
            return -0.109852;
          } else {
            return -0.118785;
          }
        } else {
          return 0.024638;
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[4] <= 0.000304) {
          if (f[6] <= 0.000474) {
            if (f[17] <= 0.653149) {
              if (f[1] <= -3.374326) {
                return 0.069843;
              } else {
                if (f[17] <= 0.475375) {
                  return 0.007412;
                } else {
                  return -0.028636;
                }
              }
            } else {
              if (f[16] <= 0.414619) {
                if (f[3] <= 0.000094) {
                  return -0.072776;
                } else {
                  return 0.016873;
                }
              } else {
                if (f[3] <= 0.000061) {
                  return 0.027427;
                } else {
                  return 0.091112;
                }
              }
            }
          } else {
            if (f[3] <= 0.000281) {
              if (f[17] <= 0.688293) {
                if (f[0] <= 20.846897) {
                  return 0.099612;
                } else {
                  return 0.028297;
                }
              } else {
                return -0.061271;
              }
            } else {
              if (f[7] <= -0.882572) {
                return -0.134508;
              } else {
                if (f[16] <= 0.383325) {
                  return 0.052226;
                } else {
                  return -0.060993;
                }
              }
            }
          }
        } else {
          if (f[15] <= 0.000002) {
            if (f[16] <= 0.481917) {
              if (f[9] <= 0.488325) {
                return 0.100497;
              } else {
                if (f[15] <= 0.000001) {
                  return 0.057135;
                } else {
                  return -0.014493;
                }
              }
            } else {
              if (f[6] <= 0.000027) {
                if (f[1] <= 2.185691) {
                  return 0.029723;
                } else {
                  return 0.070231;
                }
              } else {
                if (f[3] <= 0.000061) {
                  return 0.005170;
                } else {
                  return -0.105181;
                }
              }
            }
          } else {
            if (f[17] <= 0.543659) {
              if (f[0] <= 45.914870) {
                if (f[6] <= 0.000414) {
                  return 0.048465;
                } else {
                  return -0.055119;
                }
              } else {
                if (f[17] <= 0.517398) {
                  return -0.055371;
                } else {
                  return -0.141747;
                }
              }
            } else {
              if (f[4] <= 0.000313) {
                if (f[14] <= 0.000187) {
                  return 0.058435;
                } else {
                  return -0.003502;
                }
              } else {
                if (f[0] <= 88.707809) {
                  return 0.007959;
                } else {
                  return -0.112448;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.494471) {
          if (f[3] <= 0.000060) {
            return -0.109200;
          } else {
            return -0.120219;
          }
        } else {
          return 0.023082;
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[10] <= 0.535845) {
        if (f[7] <= -0.893444) {
          if (f[5] <= -0.002248) {
            return 0.089151;
          } else {
            if (f[8] <= -0.001003) {
              if (f[17] <= 0.520726) {
                return 0.009573;
              } else {
                if (f[18] <= 0.015000) {
                  return -0.065128;
                } else {
                  return -0.134674;
                }
              }
            } else {
              if (f[1] <= -2.126762) {
                if (f[7] <= -0.946015) {
                  return 0.097074;
                } else {
                  return 0.015424;
                }
              } else {
                if (f[14] <= 0.000161) {
                  return -0.032004;
                } else {
                  return 0.000699;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.525572) {
            if (f[19] <= 0.002633) {
              if (f[19] <= 0.002620) {
                return -0.097340;
              } else {
                return 0.026895;
              }
            } else {
              if (f[6] <= 0.000670) {
                return -0.110810;
              } else {
                return -0.126153;
              }
            }
          } else {
            return 0.046171;
          }
        }
      } else {
        return 0.054630;
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[15] <= -0.000002) {
        if (f[5] <= 0.000209) {
          if (f[16] <= 0.114629) {
            return 0.052011;
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000580) {
                return -0.000468;
              } else {
                return 0.084870;
              }
            } else {
              if (f[16] <= 0.176078) {
                return -0.097513;
              } else {
                if (f[14] <= 0.000190) {
                  return -0.024096;
                } else {
                  return 0.062877;
                }
              }
            }
          }
        } else {
          return 0.072494;
        }
      } else {
        if (f[9] <= 0.481100) {
          if (f[9] <= 0.461165) {
            if (f[3] <= 0.000061) {
              return -0.131717;
            } else {
              if (f[6] <= 0.000285) {
                if (f[6] <= 0.000183) {
                  return 0.010408;
                } else {
                  return 0.111029;
                }
              } else {
                if (f[14] <= 0.000176) {
                  return 0.020083;
                } else {
                  return -0.113288;
                }
              }
            }
          } else {
            if (f[14] <= 0.000184) {
              if (f[17] <= 0.461889) {
                return 0.062544;
              } else {
                if (f[9] <= 0.475251) {
                  return 0.012343;
                } else {
                  return -0.063366;
                }
              }
            } else {
              if (f[16] <= 0.485050) {
                if (f[16] <= 0.422068) {
                  return 0.050875;
                } else {
                  return 0.134452;
                }
              } else {
                return 0.007299;
              }
            }
          }
        } else {
          if (f[9] <= 0.523819) {
            if (f[1] <= 1.999357) {
              if (f[3] <= 0.000060) {
                if (f[19] <= 0.002583) {
                  return -0.038926;
                } else {
                  return -0.108806;
                }
              } else {
                if (f[9] <= 0.509786) {
                  return -0.003395;
                } else {
                  return -0.044982;
                }
              }
            } else {
              if (f[15] <= -0.000000) {
                if (f[17] <= 0.640948) {
                  return -0.129234;
                } else {
                  return 0.055409;
                }
              } else {
                if (f[17] <= 0.645485) {
                  return 0.065039;
                } else {
                  return -0.032434;
                }
              }
            }
          } else {
            if (f[2] <= 0.001470) {
              if (f[7] <= -0.976536) {
                if (f[3] <= 0.000060) {
                  return -0.013235;
                } else {
                  return 0.074868;
                }
              } else {
                if (f[9] <= 0.533940) {
                  return 0.006521;
                } else {
                  return -0.120935;
                }
              }
            } else {
              return 0.039068;
            }
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[15] <= -0.000018) {
          if (f[14] <= -0.000580) {
            if (f[15] <= -0.000026) {
              if (f[4] <= -0.001322) {
                if (f[3] <= 0.000270) {
                  return -0.051580;
                } else {
                  return 0.034979;
                }
              } else {
                return 0.059265;
              }
            } else {
              if (f[15] <= -0.000021) {
                return -0.096591;
              } else {
                return 0.016534;
              }
            }
          } else {
            if (f[2] <= 0.001421) {
              return 0.094657;
            } else {
              return 0.083311;
            }
          }
        } else {
          if (f[4] <= -0.000689) {
            if (f[16] <= 0.359753) {
              if (f[8] <= -0.000360) {
                if (f[5] <= -0.001025) {
                  return -0.111874;
                } else {
                  return -0.125032;
                }
              } else {
                return -0.011501;
              }
            } else {
              if (f[8] <= -0.001003) {
                if (f[2] <= 0.004381) {
                  return -0.123175;
                } else {
                  return -0.018212;
                }
              } else {
                if (f[0] <= 25.233281) {
                  return 0.072760;
                } else {
                  return -0.022786;
                }
              }
            }
          } else {
            if (f[15] <= -0.000002) {
              if (f[14] <= 0.000039) {
                if (f[6] <= 0.000471) {
                  return -0.046389;
                } else {
                  return 0.088402;
                }
              } else {
                if (f[4] <= -0.000041) {
                  return 0.020851;
                } else {
                  return 0.078419;
                }
              }
            } else {
              if (f[9] <= 0.483821) {
                if (f[9] <= 0.461165) {
                  return -0.025255;
                } else {
                  return 0.026104;
                }
              } else {
                if (f[9] <= 0.486355) {
                  return -0.079408;
                } else {
                  return -0.007169;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.495536) {
          if (f[18] <= 0.188333) {
            return -0.117098;
          } else {
            return -0.106655;
          }
        } else {
          return 0.038309;
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[10] <= 0.535845) {
        if (f[3] <= 0.000281) {
          if (f[3] <= 0.000270) {
            if (f[4] <= -0.001331) {
              if (f[4] <= -0.002047) {
                return -0.006973;
              } else {
                if (f[0] <= 24.227779) {
                  return -0.116502;
                } else {
                  return -0.103140;
                }
              }
            } else {
              if (f[0] <= 24.780349) {
                if (f[17] <= 0.528733) {
                  return 0.092428;
                } else {
                  return 0.002874;
                }
              } else {
                if (f[17] <= 0.549629) {
                  return -0.010617;
                } else {
                  return 0.007789;
                }
              }
            }
          } else {
            return 0.114181;
          }
        } else {
          if (f[9] <= 0.525572) {
            if (f[19] <= 0.002633) {
              if (f[19] <= 0.002620) {
                return -0.090863;
              } else {
                return 0.024042;
              }
            } else {
              if (f[6] <= 0.000670) {
                return -0.106785;
              } else {
                return -0.122378;
              }
            }
          } else {
            return 0.040282;
          }
        }
      } else {
        return 0.050960;
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[15] <= -0.000006) {
        if (f[5] <= 0.000209) {
          if (f[1] <= 1.070011) {
            if (f[14] <= -0.000641) {
              if (f[12] <= 9.661885) {
                return -0.082689;
              } else {
                if (f[17] <= 0.514890) {
                  return -0.040122;
                } else {
                  return 0.010062;
                }
              }
            } else {
              if (f[19] <= 0.002620) {
                if (f[15] <= -0.000012) {
                  return 0.092741;
                } else {
                  return 0.024230;
                }
              } else {
                return -0.023702;
              }
            }
          } else {
            return -0.087590;
          }
        } else {
          if (f[15] <= -0.000010) {
            return 0.092774;
          } else {
            return 0.067768;
          }
        }
      } else {
        if (f[6] <= 0.000773) {
          if (f[15] <= 0.000019) {
            if (f[14] <= 0.000039) {
              if (f[1] <= -2.059095) {
                return 0.016445;
              } else {
                if (f[3] <= 0.000106) {
                  return -0.020810;
                } else {
                  return -0.151227;
                }
              }
            } else {
              if (f[2] <= 0.002865) {
                if (f[19] <= 0.002602) {
                  return -0.003482;
                } else {
                  return -0.075129;
                }
              } else {
                if (f[19] <= 0.002606) {
                  return 0.053790;
                } else {
                  return -0.007793;
                }
              }
            }
          } else {
            return -0.125399;
          }
        } else {
          if (f[5] <= 0.000588) {
            return -0.005069;
          } else {
            return 0.083769;
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[19] <= 0.002582) {
          return 0.098488;
        } else {
          if (f[4] <= 0.000304) {
            if (f[1] <= 1.783283) {
              if (f[18] <= 0.091667) {
                if (f[6] <= 0.000474) {
                  return -0.011312;
                } else {
                  return 0.017126;
                }
              } else {
                if (f[1] <= 1.644946) {
                  return -0.000342;
                } else {
                  return 0.084268;
                }
              }
            } else {
              if (f[6] <= 0.000018) {
                if (f[9] <= 0.501594) {
                  return 0.058233;
                } else {
                  return -0.075716;
                }
              } else {
                if (f[15] <= -0.000001) {
                  return -0.051185;
                } else {
                  return -0.107893;
                }
              }
            }
          } else {
            if (f[15] <= 0.000002) {
              if (f[16] <= 0.481917) {
                if (f[16] <= 0.422068) {
                  return 0.036538;
                } else {
                  return 0.083865;
                }
              } else {
                if (f[14] <= 0.000193) {
                  return 0.018427;
                } else {
                  return -0.086277;
                }
              }
            } else {
              if (f[7] <= -0.975785) {
                if (f[19] <= 0.002584) {
                  return 0.039215;
                } else {
                  return -0.073846;
                }
              } else {
                if (f[1] <= 0.854430) {
                  return 0.015600;
                } else {
                  return -0.061804;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.495536) {
          if (f[3] <= 0.000061) {
            return -0.103740;
          } else {
            return -0.112705;
          }
        } else {
          return 0.034903;
        }
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[15] <= -0.000001) {
        if (f[4] <= 0.000287) {
          if (f[16] <= 0.114629) {
            return 0.047719;
          } else {
            if (f[17] <= 0.588303) {
              if (f[15] <= -0.000002) {
                if (f[19] <= 0.002609) {
                  return 0.004017;
                } else {
                  return -0.058286;
                }
              } else {
                return -0.102470;
              }
            } else {
              if (f[16] <= 0.376464) {
                if (f[14] <= 0.000175) {
                  return -0.046595;
                } else {
                  return 0.038037;
                }
              } else {
                if (f[3] <= 0.000236) {
                  return 0.054139;
                } else {
                  return -0.005829;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000005) {
            if (f[15] <= -0.000012) {
              return 0.089618;
            } else {
              return 0.092322;
            }
          } else {
            if (f[2] <= 0.001422) {
              return 0.079687;
            } else {
              return 0.009461;
            }
          }
        }
      } else {
        if (f[10] <= 0.525245) {
          if (f[7] <= -0.976734) {
            if (f[9] <= 0.461165) {
              if (f[7] <= -0.977113) {
                return -0.110867;
              } else {
                return -0.119717;
              }
            } else {
              if (f[4] <= 0.000280) {
                return 0.044727;
              } else {
                if (f[4] <= 0.000295) {
                  return -0.058783;
                } else {
                  return -0.010938;
                }
              }
            }
          } else {
            if (f[9] <= 0.475251) {
              if (f[0] <= 100.000000) {
                if (f[6] <= 0.000176) {
                  return -0.027792;
                } else {
                  return 0.020538;
                }
              } else {
                return 0.082132;
              }
            } else {
              if (f[9] <= 0.478380) {
                return -0.090870;
              } else {
                if (f[3] <= 0.000060) {
                  return 0.049803;
                } else {
                  return -0.007793;
                }
              }
            }
          }
        } else {
          if (f[5] <= 0.000589) {
            return 0.084469;
          } else {
            return -0.023622;
          }
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[15] <= -0.000018) {
        if (f[14] <= -0.000580) {
          if (f[17] <= 0.533005) {
            if (f[7] <= -0.921264) {
              return -0.099030;
            } else {
              return 0.004336;
            }
          } else {
            if (f[4] <= -0.001322) {
              if (f[3] <= 0.000270) {
                return -0.088237;
              } else {
                return 0.054242;
              }
            } else {
              return 0.047991;
            }
          }
        } else {
          if (f[7] <= -0.959588) {
            return 0.093445;
          } else {
            return 0.075451;
          }
        }
      } else {
        if (f[4] <= -0.000689) {
          if (f[16] <= 0.359753) {
            if (f[17] <= 0.656105) {
              if (f[5] <= -0.001025) {
                return -0.105276;
              } else {
                return -0.118188;
              }
            } else {
              return -0.004059;
            }
          } else {
            if (f[5] <= -0.001025) {
              if (f[5] <= -0.001786) {
                return 0.011706;
              } else {
                return -0.107511;
              }
            } else {
              return 0.039855;
            }
          }
        } else {
          if (f[15] <= -0.000002) {
            if (f[14] <= 0.000039) {
              if (f[9] <= 0.539081) {
                if (f[14] <= -0.000352) {
                  return 0.003362;
                } else {
                  return -0.100267;
                }
              } else {
                return 0.059719;
              }
            } else {
              if (f[4] <= -0.000041) {
                if (f[2] <= 0.001089) {
                  return -0.035604;
                } else {
                  return 0.074198;
                }
              } else {
                if (f[16] <= 0.406933) {
                  return 0.089412;
                } else {
                  return 0.043441;
                }
              }
            }
          } else {
            if (f[19] <= 0.002595) {
              if (f[15] <= 0.000009) {
                if (f[4] <= 0.000294) {
                  return -0.022794;
                } else {
                  return 0.005202;
                }
              } else {
                if (f[16] <= 0.237867) {
                  return -0.010262;
                } else {
                  return -0.088413;
                }
              }
            } else {
              if (f[9] <= 0.523819) {
                if (f[15] <= 0.000016) {
                  return 0.011590;
                } else {
                  return -0.046209;
                }
              } else {
                if (f[5] <= -0.000988) {
                  return 0.015944;
                } else {
                  return 0.083039;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[19] <= 0.002582) {
          return 0.094041;
        } else {
          if (f[4] <= 0.000304) {
            if (f[5] <= 0.000602) {
              if (f[1] <= 1.816215) {
                if (f[10] <= 0.527958) {
                  return 0.000101;
                } else {
                  return 0.068716;
                }
              } else {
                if (f[18] <= 0.121667) {
                  return -0.097273;
                } else {
                  return 0.002440;
                }
              }
            } else {
              if (f[16] <= 0.441770) {
                if (f[16] <= 0.384957) {
                  return -0.061948;
                } else {
                  return 0.031022;
                }
              } else {
                if (f[2] <= 0.001457) {
                  return -0.118901;
                } else {
                  return -0.063436;
                }
              }
            }
          } else {
            if (f[15] <= 0.000003) {
              if (f[16] <= 0.481917) {
                if (f[2] <= 0.001039) {
                  return -0.002172;
                } else {
                  return 0.054749;
                }
              } else {
                if (f[19] <= 0.002583) {
                  return 0.013986;
                } else {
                  return -0.103207;
                }
              }
            } else {
              if (f[17] <= 0.501643) {
                if (f[4] <= 0.000307) {
                  return 0.006705;
                } else {
                  return -0.084016;
                }
              } else {
                if (f[0] <= 100.000000) {
                  return 0.021719;
                } else {
                  return -0.042875;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.495536) {
          if (f[9] <= 0.470713) {
            return -0.110052;
          } else {
            return -0.101071;
          }
        } else {
          return 0.032611;
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[15] <= -0.000018) {
        if (f[4] <= -0.000430) {
          if (f[18] <= 0.028333) {
            if (f[4] <= -0.001177) {
              if (f[17] <= 0.588303) {
                if (f[4] <= -0.001811) {
                  return 0.004414;
                } else {
                  return -0.117822;
                }
              } else {
                return 0.038942;
              }
            } else {
              return 0.073876;
            }
          } else {
            return -0.041741;
          }
        } else {
          return 0.091782;
        }
      } else {
        if (f[4] <= -0.000689) {
          if (f[17] <= 0.639069) {
            if (f[0] <= 26.538485) {
              if (f[6] <= 0.000423) {
                return 0.069249;
              } else {
                return -0.080330;
              }
            } else {
              if (f[15] <= -0.000013) {
                return -0.073326;
              } else {
                if (f[6] <= 0.000360) {
                  return -0.122544;
                } else {
                  return -0.106360;
                }
              }
            }
          } else {
            return 0.014373;
          }
        } else {
          if (f[6] <= 0.000773) {
            if (f[15] <= 0.000019) {
              if (f[1] <= -2.126762) {
                if (f[0] <= 40.097266) {
                  return 0.013159;
                } else {
                  return 0.129737;
                }
              } else {
                if (f[8] <= -0.000324) {
                  return -0.067800;
                } else {
                  return -0.001266;
                }
              }
            } else {
              return -0.119766;
            }
          } else {
            if (f[5] <= 0.000588) {
              return 0.013742;
            } else {
              return 0.079447;
            }
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[1] <= 2.106870) {
          if (f[15] <= -0.000017) {
            if (f[14] <= -0.000580) {
              if (f[15] <= -0.000026) {
                if (f[4] <= -0.001322) {
                  return -0.003089;
                } else {
                  return 0.052601;
                }
              } else {
                if (f[15] <= -0.000021) {
                  return -0.090600;
                } else {
                  return 0.002364;
                }
              }
            } else {
              if (f[5] <= -0.000021) {
                return 0.060178;
              } else {
                return 0.091177;
              }
            }
          } else {
            if (f[14] <= 0.000039) {
              if (f[1] <= -2.059095) {
                if (f[2] <= 0.003202) {
                  return 0.059334;
                } else {
                  return -0.064593;
                }
              } else {
                if (f[9] <= 0.539081) {
                  return -0.071327;
                } else {
                  return 0.029236;
                }
              }
            } else {
              if (f[15] <= -0.000004) {
                if (f[4] <= -0.000234) {
                  return -0.007890;
                } else {
                  return 0.087145;
                }
              } else {
                if (f[9] <= 0.483821) {
                  return 0.011264;
                } else {
                  return -0.009602;
                }
              }
            }
          }
        } else {
          if (f[2] <= 0.001440) {
            if (f[1] <= 2.167645) {
              return 0.038639;
            } else {
              return 0.082798;
            }
          } else {
            if (f[19] <= 0.002583) {
              return -0.087499;
            } else {
              return 0.077749;
            }
          }
        }
      } else {
        if (f[6] <= 0.000024) {
          if (f[18] <= 0.185000) {
            return -0.109892;
          } else {
            return -0.099311;
          }
        } else {
          return 0.046149;
        }
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[5] <= 0.000632) {
        if (f[0] <= 100.000000) {
          if (f[16] <= 0.575630) {
            if (f[15] <= 0.000000) {
              if (f[5] <= -0.001025) {
                if (f[5] <= -0.001498) {
                  return 0.003077;
                } else {
                  return -0.068465;
                }
              } else {
                if (f[6] <= 0.000372) {
                  return 0.009925;
                } else {
                  return 0.055951;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                return -0.133508;
              } else {
                if (f[17] <= 0.754998) {
                  return -0.002071;
                } else {
                  return -0.103824;
                }
              }
            }
          } else {
            if (f[16] <= 0.621588) {
              if (f[19] <= 0.002582) {
                return -0.099001;
              } else {
                return -0.116437;
              }
            } else {
              return -0.041881;
            }
          }
        } else {
          if (f[1] <= 1.571658) {
            return 0.085337;
          } else {
            if (f[19] <= 0.002583) {
              return 0.049682;
            } else {
              return -0.055264;
            }
          }
        }
      } else {
        if (f[15] <= 0.000003) {
          return -0.106878;
        } else {
          return -0.005581;
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[5] <= -0.002602) {
        if (f[6] <= 0.000615) {
          return 0.008063;
        } else {
          return -0.115704;
        }
      } else {
        if (f[5] <= -0.002248) {
          return 0.060147;
        } else {
          if (f[6] <= 0.000773) {
            if (f[15] <= 0.000017) {
              if (f[4] <= 0.000304) {
                if (f[5] <= 0.000602) {
                  return -0.001371;
                } else {
                  return -0.044061;
                }
              } else {
                if (f[15] <= -0.000001) {
                  return 0.072832;
                } else {
                  return 0.006863;
                }
              }
            } else {
              if (f[7] <= -0.919253) {
                return -0.040089;
              } else {
                return -0.120464;
              }
            }
          } else {
            if (f[5] <= 0.000588) {
              return 0.015727;
            } else {
              return 0.075086;
            }
          }
        }
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[3] <= 0.000281) {
        if (f[6] <= 0.000474) {
          if (f[4] <= -0.001331) {
            if (f[3] <= 0.000224) {
              if (f[16] <= 0.428558) {
                return -0.100415;
              } else {
                return -0.094379;
              }
            } else {
              return -0.114374;
            }
          } else {
            if (f[17] <= 0.549629) {
              if (f[17] <= 0.520099) {
                if (f[3] <= 0.000197) {
                  return -0.004925;
                } else {
                  return 0.068121;
                }
              } else {
                if (f[10] <= 0.510867) {
                  return -0.052645;
                } else {
                  return 0.051258;
                }
              }
            } else {
              if (f[9] <= 0.506982) {
                if (f[18] <= 0.051667) {
                  return 0.036094;
                } else {
                  return -0.003026;
                }
              } else {
                if (f[3] <= 0.000058) {
                  return 0.112192;
                } else {
                  return -0.025496;
                }
              }
            }
          }
        } else {
          if (f[4] <= 0.000310) {
            if (f[17] <= 0.693090) {
              if (f[19] <= 0.002588) {
                return 0.097323;
              } else {
                if (f[7] <= -0.904536) {
                  return 0.017245;
                } else {
                  return 0.082608;
                }
              }
            } else {
              return -0.054113;
            }
          } else {
            return -0.069465;
          }
        }
      } else {
        if (f[9] <= 0.533397) {
          if (f[19] <= 0.002633) {
            if (f[19] <= 0.002621) {
              return -0.068283;
            } else {
              return 0.023646;
            }
          } else {
            if (f[6] <= 0.000670) {
              return -0.101913;
            } else {
              return -0.117852;
            }
          }
        } else {
          return 0.078211;
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[5] <= 0.000632) {
        if (f[0] <= 100.000000) {
          if (f[10] <= 0.525245) {
            if (f[15] <= 0.000000) {
              if (f[4] <= 0.000298) {
                if (f[0] <= 100.000000) {
                  return 0.002376;
                } else {
                  return -0.059480;
                }
              } else {
                if (f[15] <= -0.000001) {
                  return 0.064485;
                } else {
                  return 0.012464;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                if (f[3] <= 0.000060) {
                  return -0.110676;
                } else {
                  return -0.133030;
                }
              } else {
                if (f[17] <= 0.754998) {
                  return -0.004822;
                } else {
                  return -0.097381;
                }
              }
            }
          } else {
            if (f[8] <= 0.000622) {
              if (f[0] <= 50.134991) {
                return 0.052787;
              } else {
                return -0.067997;
              }
            } else {
              return 0.089077;
            }
          }
        } else {
          if (f[2] <= 0.001455) {
            return 0.079013;
          } else {
            if (f[8] <= 0.000672) {
              return -0.035717;
            } else {
              return 0.055852;
            }
          }
        }
      } else {
        if (f[15] <= 0.000003) {
          return -0.099699;
        } else {
          return -0.004265;
        }
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[5] <= -0.002602) {
        if (f[15] <= -0.000029) {
          return 0.001510;
        } else {
          return -0.110842;
        }
      } else {
        if (f[5] <= -0.002248) {
          return 0.054211;
        } else {
          if (f[4] <= -0.001331) {
            if (f[16] <= 0.457426) {
              if (f[0] <= 24.780349) {
                return -0.125841;
              } else {
                if (f[14] <= 0.000177) {
                  return -0.098276;
                } else {
                  return -0.016224;
                }
              }
            } else {
              return 0.019593;
            }
          } else {
            if (f[15] <= -0.000017) {
              if (f[14] <= -0.000488) {
                if (f[18] <= 0.025000) {
                  return 0.035459;
                } else {
                  return -0.056148;
                }
              } else {
                return 0.092668;
              }
            } else {
              if (f[14] <= 0.000161) {
                if (f[1] <= -2.059095) {
                  return 0.019315;
                } else {
                  return -0.041414;
                }
              } else {
                if (f[15] <= -0.000004) {
                  return 0.050640;
                } else {
                  return -0.000849;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[16] <= 0.575630) {
        if (f[6] <= 0.000018) {
          if (f[9] <= 0.522052) {
            if (f[5] <= 0.000588) {
              return 0.078328;
            } else {
              if (f[0] <= 100.000000) {
                if (f[0] <= 100.000000) {
                  return 0.013697;
                } else {
                  return -0.079628;
                }
              } else {
                return 0.060533;
              }
            }
          } else {
            return -0.047829;
          }
        } else {
          if (f[19] <= 0.002583) {
            if (f[9] <= 0.473799) {
              return 0.032623;
            } else {
              if (f[6] <= 0.000052) {
                if (f[5] <= 0.000613) {
                  return -0.118643;
                } else {
                  return -0.032306;
                }
              } else {
                return -0.001598;
              }
            }
          } else {
            if (f[6] <= 0.000041) {
              return 0.067085;
            } else {
              if (f[5] <= 0.000607) {
                if (f[0] <= 100.000000) {
                  return 0.001277;
                } else {
                  return 0.101292;
                }
              } else {
                if (f[16] <= 0.489526) {
                  return -0.006295;
                } else {
                  return -0.119535;
                }
              }
            }
          }
        }
      } else {
        if (f[6] <= 0.000032) {
          if (f[4] <= 0.000304) {
            return -0.096156;
          } else {
            return -0.103844;
          }
        } else {
          return 0.064961;
        }
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[2] <= 0.001039) {
        if (f[3] <= 0.000114) {
          if (f[1] <= 1.035573) {
            if (f[16] <= 0.203004) {
              if (f[1] <= 0.182868) {
                return 0.030847;
              } else {
                return -0.118573;
              }
            } else {
              if (f[4] <= 0.000294) {
                return -0.028979;
              } else {
                if (f[3] <= 0.000094) {
                  return 0.062227;
                } else {
                  return 0.117585;
                }
              }
            }
          } else {
            if (f[3] <= 0.000088) {
              if (f[14] <= 0.000174) {
                return -0.025207;
              } else {
                if (f[3] <= 0.000075) {
                  return -0.106785;
                } else {
                  return -0.123097;
                }
              }
            } else {
              if (f[16] <= 0.291152) {
                return -0.104711;
              } else {
                return 0.074465;
              }
            }
          }
        } else {
          if (f[19] <= 0.002585) {
            return -0.011197;
          } else {
            if (f[16] <= 0.128555) {
              return -0.076253;
            } else {
              return -0.138357;
            }
          }
        }
      } else {
        if (f[10] <= 0.506237) {
          if (f[10] <= 0.501642) {
            if (f[2] <= 0.001300) {
              if (f[0] <= 100.000000) {
                if (f[3] <= 0.000120) {
                  return -0.000509;
                } else {
                  return 0.054143;
                }
              } else {
                return 0.116279;
              }
            } else {
              if (f[0] <= 100.000000) {
                if (f[3] <= 0.000060) {
                  return -0.023522;
                } else {
                  return 0.002826;
                }
              } else {
                return -0.088207;
              }
            }
          } else {
            return -0.103417;
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[6] <= 0.000114) {
              return 0.084943;
            } else {
              if (f[10] <= 0.519958) {
                if (f[9] <= 0.544019) {
                  return -0.062574;
                } else {
                  return 0.042891;
                }
              } else {
                return 0.056572;
              }
            }
          } else {
            if (f[10] <= 0.517501) {
              return 0.074783;
            } else {
              return -0.131098;
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[5] <= 0.000209) {
        if (f[5] <= 0.000096) {
          if (f[7] <= -0.962231) {
            return 0.071029;
          } else {
            if (f[5] <= -0.000038) {
              if (f[2] <= 0.000802) {
                return 0.089559;
              } else {
                if (f[2] <= 0.001039) {
                  return -0.083913;
                } else {
                  return 0.001780;
                }
              }
            } else {
              if (f[16] <= 0.197361) {
                return -0.012061;
              } else {
                return -0.139236;
              }
            }
          }
        } else {
          if (f[1] <= 1.298728) {
            if (f[8] <= 0.000282) {
              if (f[15] <= -0.000000) {
                return -0.126305;
              } else {
                return -0.144503;
              }
            } else {
              return -0.114238;
            }
          } else {
            return 0.017484;
          }
        }
      } else {
        if (f[15] <= -0.000007) {
          if (f[19] <= 0.002583) {
            return 0.077868;
          } else {
            return 0.089584;
          }
        } else {
          if (f[5] <= 0.000422) {
            if (f[6] <= 0.000217) {
              if (f[8] <= 0.000366) {
                return 0.038965;
              } else {
                return -0.124687;
              }
            } else {
              return 0.110323;
            }
          } else {
            if (f[15] <= 0.000007) {
              if (f[3] <= 0.000122) {
                if (f[6] <= 0.000479) {
                  return -0.004206;
                } else {
                  return 0.136899;
                }
              } else {
                return 0.118622;
              }
            } else {
              if (f[19] <= 0.002599) {
                if (f[2] <= 0.001300) {
                  return 0.040387;
                } else {
                  return -0.066680;
                }
              } else {
                return 0.050056;
              }
            }
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[6] <= 0.000005) {
        return 0.060708;
      } else {
        if (f[6] <= 0.000007) {
          if (f[0] <= 100.000000) {
            return -0.020441;
          } else {
            return -0.113685;
          }
        } else {
          if (f[1] <= 2.154464) {
            if (f[19] <= 0.002582) {
              return 0.070391;
            } else {
              if (f[19] <= 0.002582) {
                if (f[19] <= 0.002582) {
                  return 0.016185;
                } else {
                  return -0.084145;
                }
              } else {
                if (f[10] <= 0.525245) {
                  return -0.001051;
                } else {
                  return 0.037314;
                }
              }
            }
          } else {
            return 0.056589;
          }
        }
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[5] <= -0.002602) {
        if (f[6] <= 0.000615) {
          return 0.009398;
        } else {
          return -0.107978;
        }
      } else {
        if (f[6] <= 0.000773) {
          if (f[0] <= 16.890090) {
            return -0.082283;
          } else {
            if (f[5] <= -0.002248) {
              return 0.058769;
            } else {
              if (f[4] <= 0.000304) {
                if (f[5] <= 0.000602) {
                  return -0.001167;
                } else {
                  return -0.041699;
                }
              } else {
                if (f[9] <= 0.461967) {
                  return -0.037813;
                } else {
                  return 0.013467;
                }
              }
            }
          }
        } else {
          if (f[18] <= 0.015000) {
            return 0.074471;
          } else {
            return 0.011867;
          }
        }
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[5] <= 0.000209) {
        if (f[5] <= 0.000080) {
          if (f[7] <= -0.962057) {
            return 0.068283;
          } else {
            if (f[5] <= -0.000038) {
              if (f[2] <= 0.000802) {
                return 0.082767;
              } else {
                if (f[2] <= 0.001039) {
                  return -0.079174;
                } else {
                  return 0.001592;
                }
              }
            } else {
              return -0.073874;
            }
          }
        } else {
          if (f[1] <= 1.298728) {
            if (f[15] <= -0.000002) {
              return -0.078961;
            } else {
              if (f[17] <= 0.533804) {
                if (f[2] <= 0.000967) {
                  return -0.107732;
                } else {
                  return -0.130663;
                }
              } else {
                return -0.138057;
              }
            }
          } else {
            return 0.008323;
          }
        }
      } else {
        if (f[15] <= -0.000007) {
          if (f[15] <= -0.000011) {
            return 0.087934;
          } else {
            return 0.074923;
          }
        } else {
          if (f[5] <= 0.000422) {
            if (f[6] <= 0.000217) {
              if (f[3] <= 0.000080) {
                if (f[1] <= 1.599318) {
                  return -0.120282;
                } else {
                  return -0.012753;
                }
              } else {
                return 0.053091;
              }
            } else {
              return 0.102098;
            }
          } else {
            if (f[15] <= 0.000007) {
              if (f[3] <= 0.000122) {
                if (f[6] <= 0.000479) {
                  return -0.003736;
                } else {
                  return 0.127600;
                }
              } else {
                return 0.113134;
              }
            } else {
              if (f[11] <= -2.800384) {
                if (f[3] <= 0.000214) {
                  return -0.050481;
                } else {
                  return 0.055562;
                }
              } else {
                return 0.081634;
              }
            }
          }
        }
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[5] <= 0.000632) {
        if (f[0] <= 100.000000) {
          if (f[16] <= 0.575630) {
            if (f[6] <= 0.000005) {
              return 0.069775;
            } else {
              if (f[17] <= 0.574300) {
                if (f[17] <= 0.528733) {
                  return 0.000955;
                } else {
                  return -0.022338;
                }
              } else {
                if (f[0] <= 23.366570) {
                  return -0.044652;
                } else {
                  return 0.012945;
                }
              }
            }
          } else {
            if (f[17] <= 0.600063) {
              if (f[6] <= 0.000009) {
                return -0.094451;
              } else {
                return -0.111501;
              }
            } else {
              return -0.026083;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            return 0.068568;
          } else {
            if (f[5] <= 0.000622) {
              return 0.026673;
            } else {
              return -0.021385;
            }
          }
        }
      } else {
        if (f[9] <= 0.519439) {
          return -0.093325;
        } else {
          return -0.004161;
        }
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[3] <= 0.000281) {
        if (f[5] <= -0.002248) {
          return 0.067632;
        } else {
          if (f[4] <= -0.001331) {
            if (f[9] <= 0.463134) {
              return 0.052062;
            } else {
              if (f[16] <= 0.441770) {
                if (f[7] <= -0.917155) {
                  return -0.097637;
                } else {
                  return -0.130713;
                }
              } else {
                return -0.046832;
              }
            }
          } else {
            if (f[15] <= -0.000018) {
              if (f[14] <= -0.000525) {
                if (f[2] <= 0.001606) {
                  return -0.016664;
                } else {
                  return 0.065268;
                }
              } else {
                return 0.091136;
              }
            } else {
              if (f[14] <= -0.000641) {
                if (f[9] <= 0.499682) {
                  return 0.019184;
                } else {
                  return -0.092729;
                }
              } else {
                if (f[0] <= 24.780349) {
                  return 0.034645;
                } else {
                  return -0.001451;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.536772) {
          if (f[1] <= -3.374326) {
            if (f[16] <= 0.457426) {
              if (f[8] <= -0.001381) {
                return -0.099901;
              } else {
                return -0.111008;
              }
            } else {
              return -0.014249;
            }
          } else {
            return 0.001631;
          }
        } else {
          return 0.081251;
        }
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[5] <= 0.000632) {
        if (f[0] <= 100.000000) {
          if (f[16] <= 0.575630) {
            if (f[6] <= 0.000005) {
              return 0.064892;
            } else {
              if (f[19] <= 0.002582) {
                return 0.064926;
              } else {
                if (f[14] <= 0.000181) {
                  return -0.006685;
                } else {
                  return 0.007496;
                }
              }
            }
          } else {
            if (f[17] <= 0.600063) {
              if (f[1] <= 2.100785) {
                return -0.109466;
              } else {
                return -0.093056;
              }
            } else {
              return -0.023997;
            }
          }
        } else {
          if (f[1] <= 1.571658) {
            return 0.071875;
          } else {
            if (f[19] <= 0.002583) {
              return 0.044636;
            } else {
              return -0.058327;
            }
          }
        }
      } else {
        if (f[4] <= 0.000319) {
          return -0.092090;
        } else {
          return -0.002435;
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[4] <= 0.000322) {
        if (f[4] <= 0.000304) {
          if (f[5] <= 0.000602) {
            if (f[10] <= 0.527958) {
              if (f[17] <= 0.653149) {
                if (f[1] <= 1.055738) {
                  return 0.002636;
                } else {
                  return -0.025048;
                }
              } else {
                if (f[16] <= 0.388895) {
                  return -0.019237;
                } else {
                  return 0.051527;
                }
              }
            } else {
              return 0.042628;
            }
          } else {
            if (f[2] <= 0.001422) {
              if (f[16] <= 0.377324) {
                return -0.063003;
              } else {
                if (f[16] <= 0.441770) {
                  return 0.085568;
                } else {
                  return -0.020748;
                }
              }
            } else {
              if (f[6] <= 0.000477) {
                if (f[17] <= 0.640948) {
                  return -0.088007;
                } else {
                  return -0.018043;
                }
              } else {
                return 0.026027;
              }
            }
          }
        } else {
          if (f[17] <= 0.466768) {
            if (f[5] <= 0.000615) {
              if (f[6] <= 0.000268) {
                return -0.038107;
              } else {
                return -0.141607;
              }
            } else {
              return 0.060233;
            }
          } else {
            if (f[5] <= -0.001152) {
              return 0.066176;
            } else {
              if (f[6] <= 0.000105) {
                if (f[3] <= 0.000063) {
                  return 0.048317;
                } else {
                  return -0.071976;
                }
              } else {
                if (f[18] <= 0.048333) {
                  return 0.010582;
                } else {
                  return -0.036516;
                }
              }
            }
          }
        }
      } else {
        if (f[18] <= 0.035000) {
          return 0.020528;
        } else {
          if (f[6] <= 0.000067) {
            return -0.058017;
          } else {
            return -0.127531;
          }
        }
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[5] <= 0.000209) {
        if (f[5] <= 0.000096) {
          if (f[18] <= 0.000000) {
            if (f[2] <= 0.003644) {
              if (f[16] <= 0.315316) {
                return -0.027512;
              } else {
                return -0.139560;
              }
            } else {
              return 0.019876;
            }
          } else {
            if (f[7] <= -0.962231) {
              return 0.071105;
            } else {
              if (f[1] <= -0.496480) {
                if (f[0] <= 44.715195) {
                  return -0.001198;
                } else {
                  return 0.057263;
                }
              } else {
                if (f[3] <= 0.000105) {
                  return -0.117794;
                } else {
                  return -0.013930;
                }
              }
            }
          }
        } else {
          if (f[1] <= 1.298728) {
            if (f[8] <= 0.000282) {
              if (f[17] <= 0.529649) {
                return -0.119314;
              } else {
                return -0.131405;
              }
            } else {
              return -0.107185;
            }
          } else {
            return 0.017607;
          }
        }
      } else {
        if (f[5] <= 0.000422) {
          if (f[8] <= 0.000366) {
            if (f[4] <= 0.000295) {
              if (f[1] <= 1.199897) {
                return -0.015181;
              } else {
                return 0.071376;
              }
            } else {
              return 0.117625;
            }
          } else {
            return -0.043294;
          }
        } else {
          if (f[2] <= 0.001442) {
            if (f[17] <= 0.693090) {
              if (f[0] <= 100.000000) {
                if (f[4] <= 0.000295) {
                  return -0.010551;
                } else {
                  return 0.018647;
                }
              } else {
                return 0.066536;
              }
            } else {
              if (f[18] <= 0.098333) {
                return -0.122909;
              } else {
                return 0.004739;
              }
            }
          } else {
            if (f[0] <= 34.918028) {
              if (f[4] <= 0.000292) {
                return 0.083982;
              } else {
                if (f[9] <= 0.506818) {
                  return -0.065057;
                } else {
                  return 0.030194;
                }
              }
            } else {
              if (f[9] <= 0.451366) {
                return 0.074850;
              } else {
                if (f[0] <= 100.000000) {
                  return -0.058764;
                } else {
                  return 0.004474;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[18] <= 0.151667) {
        if (f[6] <= 0.000018) {
          if (f[1] <= 2.100785) {
            if (f[7] <= -0.977244) {
              return 0.058059;
            } else {
              return -0.073547;
            }
          } else {
            return 0.083707;
          }
        } else {
          if (f[1] <= 2.078254) {
            if (f[15] <= -0.000001) {
              if (f[4] <= 0.000132) {
                if (f[17] <= 0.569991) {
                  return -0.019621;
                } else {
                  return 0.010558;
                }
              } else {
                if (f[2] <= 0.001415) {
                  return 0.069659;
                } else {
                  return 0.012702;
                }
              }
            } else {
              if (f[16] <= 0.495794) {
                if (f[19] <= 0.002583) {
                  return 0.044448;
                } else {
                  return -0.004430;
                }
              } else {
                if (f[17] <= 0.637146) {
                  return -0.072080;
                } else {
                  return 0.038746;
                }
              }
            }
          } else {
            return -0.074854;
          }
        }
      } else {
        if (f[18] <= 0.178333) {
          if (f[17] <= 0.594720) {
            return -0.058355;
          } else {
            return -0.136389;
          }
        } else {
          if (f[2] <= 0.001442) {
            if (f[17] <= 0.519215) {
              return -0.047375;
            } else {
              return 0.069006;
            }
          } else {
            return -0.122540;
          }
        }
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[5] <= -0.002602) {
        if (f[8] <= -0.001925) {
          return -0.010570;
        } else {
          return -0.101552;
        }
      } else {
        if (f[9] <= 0.433657) {
          return 0.048505;
        } else {
          if (f[9] <= 0.461165) {
            if (f[4] <= 0.000288) {
              if (f[16] <= 0.404873) {
                return 0.068027;
              } else {
                return -0.021786;
              }
            } else {
              if (f[16] <= 0.550800) {
                if (f[16] <= 0.298604) {
                  return -0.010595;
                } else {
                  return -0.113126;
                }
              } else {
                return 0.032094;
              }
            }
          } else {
            if (f[14] <= 0.000163) {
              if (f[5] <= 0.000023) {
                if (f[7] <= -0.956724) {
                  return 0.059440;
                } else {
                  return -0.014693;
                }
              } else {
                if (f[1] <= 1.387099) {
                  return -0.100971;
                } else {
                  return -0.015586;
                }
              }
            } else {
              if (f[9] <= 0.475251) {
                if (f[16] <= 0.321123) {
                  return -0.024424;
                } else {
                  return 0.046979;
                }
              } else {
                if (f[1] <= -5.059635) {
                  return 0.087474;
                } else {
                  return -0.000773;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[15] <= -0.000018) {
        if (f[4] <= -0.000430) {
          if (f[17] <= 0.533005) {
            if (f[15] <= -0.000042) {
              return 0.044656;
            } else {
              if (f[17] <= 0.461889) {
                return -0.017124;
              } else {
                return -0.087495;
              }
            }
          } else {
            if (f[19] <= 0.002602) {
              return -0.011841;
            } else {
              if (f[16] <= 0.362338) {
                return 0.087811;
              } else {
                return 0.011910;
              }
            }
          }
        } else {
          return 0.087534;
        }
      } else {
        if (f[4] <= -0.000689) {
          if (f[16] <= 0.359753) {
            if (f[8] <= -0.000360) {
              if (f[3] <= 0.000174) {
                return -0.113182;
              } else {
                return -0.101979;
              }
            } else {
              return -0.008711;
            }
          } else {
            if (f[8] <= -0.001003) {
              if (f[8] <= -0.001326) {
                return -0.013523;
              } else {
                return -0.116616;
              }
            } else {
              if (f[17] <= 0.594720) {
                return -0.000178;
              } else {
                return 0.063171;
              }
            }
          }
        } else {
          if (f[4] <= -0.000612) {
            return 0.067759;
          } else {
            if (f[1] <= -2.126762) {
              if (f[4] <= 0.000293) {
                if (f[3] <= 0.000214) {
                  return 0.081844;
                } else {
                  return -0.011806;
                }
              } else {
                if (f[18] <= 0.021667) {
                  return -0.034736;
                } else {
                  return 0.052472;
                }
              }
            } else {
              if (f[4] <= -0.000317) {
                if (f[17] <= 0.590092) {
                  return -0.126832;
                } else {
                  return -0.052736;
                }
              } else {
                if (f[2] <= 0.003381) {
                  return -0.001429;
                } else {
                  return 0.071920;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[18] <= 0.151667) {
        if (f[1] <= 2.154464) {
          if (f[6] <= 0.000009) {
            return 0.076482;
          } else {
            if (f[9] <= 0.483821) {
              if (f[17] <= 0.593675) {
                if (f[9] <= 0.461165) {
                  return -0.032205;
                } else {
                  return 0.011326;
                }
              } else {
                if (f[5] <= 0.000250) {
                  return -0.003495;
                } else {
                  return 0.050260;
                }
              }
            } else {
              if (f[9] <= 0.523819) {
                if (f[15] <= 0.000010) {
                  return -0.005307;
                } else {
                  return -0.049622;
                }
              } else {
                if (f[2] <= 0.001376) {
                  return -0.025447;
                } else {
                  return 0.022182;
                }
              }
            }
          }
        } else {
          return 0.089118;
        }
      } else {
        if (f[9] <= 0.496706) {
          if (f[1] <= 2.084359) {
            return -0.119190;
          } else {
            if (f[19] <= 0.002582) {
              return -0.089269;
            } else {
              return -0.096043;
            }
          }
        } else {
          if (f[17] <= 0.645485) {
            if (f[17] <= 0.551303) {
              return -0.020020;
            } else {
              return 0.060358;
            }
          } else {
            return -0.081240;
          }
        }
      }
    })(f)
  ];
  const mainSum = mainScores.reduce((a,b) => a+b, 0);
  const mlProb = 1 / (1 + Math.exp(-mainSum));
  const pred = mlProb > 0.5 ? 1 : 0;
  
  // Meta model: should we take this trade?
  const mf = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0, mlProb];
  const metaScores = [
    // Meta Tree 0
    (function(f) {
      if (f[61] <= 0.693009) {
        if (f[9] <= 0.000062) {
          if (f[48] <= 0.177738) {
            if (f[53] <= -0.016747) {
              return 2.295721;
            } else {
              return 2.016650;
            }
          } else {
            if (f[30] <= 1.649355) {
              return 2.361889;
            } else {
              return 2.486226;
            }
          }
        } else {
          if (f[53] <= -0.154687) {
            if (f[9] <= 0.000163) {
              return 2.277661;
            } else {
              return 2.499314;
            }
          } else {
            if (f[13] <= -0.000635) {
              return 2.404174;
            } else {
              return 2.478172;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[30] <= -0.700679) {
            if (f[14] <= -0.000448) {
              return 2.471829;
            } else {
              return 2.114524;
            }
          } else {
            if (f[8] <= 0.000642) {
              return 2.465685;
            } else {
              return 2.406668;
            }
          }
        } else {
          if (f[29] <= 0.014096) {
            return 2.449341;
          } else {
            if (f[6] <= 0.000214) {
              return 2.497585;
            } else {
              return 2.476217;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[0] <= 87.406996) {
          if (f[52] <= -0.530924) {
            if (f[25] <= 0.250000) {
              return 0.027548;
            } else {
              return -0.168292;
            }
          } else {
            if (f[61] <= 0.193455) {
              return 0.040440;
            } else {
              return -0.003506;
            }
          }
        } else {
          if (f[61] <= 0.501183) {
            if (f[54] <= -0.123051) {
              return 0.016202;
            } else {
              return 0.043637;
            }
          } else {
            if (f[19] <= 1.831117) {
              return -0.289523;
            } else {
              return -0.074499;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[36] <= -0.208303) {
            if (f[14] <= -0.000340) {
              return 0.020016;
            } else {
              return -0.256441;
            }
          } else {
            if (f[8] <= 0.000642) {
              return 0.010576;
            } else {
              return -0.044926;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            return 0.042592;
          } else {
            if (f[45] <= 0.405408) {
              return -0.041554;
            } else {
              return 0.031891;
            }
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000062) {
          if (f[52] <= 0.219781) {
            if (f[31] <= 1.651987) {
              return -0.173218;
            } else {
              return -0.287062;
            }
          } else {
            if (f[30] <= 1.649355) {
              return -0.080000;
            } else {
              return 0.029748;
            }
          }
        } else {
          if (f[53] <= -0.154687) {
            if (f[25] <= 0.250000) {
              return 0.027845;
            } else {
              return -0.149942;
            }
          } else {
            if (f[13] <= -0.000635) {
              return -0.048551;
            } else {
              return 0.021307;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[30] <= -0.624909) {
            if (f[14] <= -0.000340) {
              return 0.019548;
            } else {
              return -0.201108;
            }
          } else {
            if (f[42] <= 0.000200) {
              return -0.030358;
            } else {
              return 0.020713;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            return 0.042428;
          } else {
            if (f[6] <= 0.000214) {
              return 0.035045;
            } else {
              return -0.042572;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000062) {
          if (f[61] <= 0.501183) {
            if (f[47] <= 0.388580) {
              return 0.044099;
            } else {
              return 0.016181;
            }
          } else {
            if (f[48] <= 0.177738) {
              return -0.203952;
            } else {
              return -0.043120;
            }
          }
        } else {
          if (f[53] <= -0.154687) {
            if (f[25] <= 0.250000) {
              return 0.027372;
            } else {
              return -0.127861;
            }
          } else {
            if (f[61] <= 0.193455) {
              return 0.040194;
            } else {
              return -0.002854;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[9] <= 0.000064) {
            if (f[3] <= 0.001431) {
              return -0.015411;
            } else {
              return 0.023004;
            }
          } else {
            if (f[8] <= 0.000654) {
              return -0.031304;
            } else {
              return -0.163018;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            return 0.042269;
          } else {
            if (f[6] <= 0.000214) {
              return 0.034687;
            } else {
              return -0.039396;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[61] <= 0.689829) {
        if (f[9] <= 0.000067) {
          if (f[61] <= 0.501183) {
            return 0.031763;
          } else {
            if (f[61] <= 0.619145) {
              return -0.190435;
            } else {
              return -0.064682;
            }
          }
        } else {
          if (f[53] <= -0.154687) {
            if (f[25] <= 0.250000) {
              return 0.026898;
            } else {
              return -0.112179;
            }
          } else {
            if (f[9] <= 0.000161) {
              return 0.001731;
            } else {
              return 0.043088;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[9] <= 0.000064) {
            if (f[27] <= 0.986068) {
              return 0.043314;
            } else {
              return -0.007601;
            }
          } else {
            if (f[8] <= 0.000749) {
              return -0.033341;
            } else {
              return -0.172592;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042912;
            } else {
              return 0.016532;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.034327;
            } else {
              return -0.036567;
            }
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[51] <= -0.090886) {
        if (f[27] <= -2.293496) {
          return -0.135686;
        } else {
          if (f[49] <= 0.387337) {
            if (f[19] <= 1.898353) {
              return -0.005479;
            } else {
              return -0.079399;
            }
          } else {
            if (f[9] <= 0.000061) {
              return -0.010039;
            } else {
              return -0.199917;
            }
          }
        }
      } else {
        if (f[2] <= 0.912833) {
          if (f[9] <= 0.000161) {
            if (f[9] <= 0.000155) {
              return 0.009074;
            } else {
              return -0.153193;
            }
          } else {
            if (f[13] <= -0.000599) {
              return 0.043278;
            } else {
              return 0.042904;
            }
          }
        } else {
          if (f[41] <= -0.000011) {
            return 0.008072;
          } else {
            if (f[6] <= 0.000214) {
              return 0.042961;
            } else {
              return 0.044006;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[57] <= 0.371582) {
        if (f[2] <= 0.912833) {
          if (f[9] <= 0.000161) {
            if (f[9] <= 0.000155) {
              return 0.008672;
            } else {
              return -0.128904;
            }
          } else {
            if (f[13] <= -0.000599) {
              return 0.043139;
            } else {
              return 0.042834;
            }
          }
        } else {
          if (f[41] <= -0.000011) {
            return 0.007803;
          } else {
            if (f[2] <= 0.914472) {
              return 0.043737;
            } else {
              return 0.042845;
            }
          }
        }
      } else {
        if (f[27] <= -2.293496) {
          if (f[58] <= -0.344900) {
            return -0.040191;
          } else {
            return -0.159273;
          }
        } else {
          if (f[53] <= -0.088684) {
            if (f[19] <= 1.898353) {
              return -0.003537;
            } else {
              return -0.071527;
            }
          } else {
            return -0.141904;
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000067) {
          if (f[61] <= 0.501183) {
            return 0.030976;
          } else {
            if (f[57] <= -0.264961) {
              return -0.034372;
            } else {
              return -0.150154;
            }
          }
        } else {
          if (f[53] <= -0.154687) {
            if (f[25] <= 0.250000) {
              return 0.026771;
            } else {
              return -0.091720;
            }
          } else {
            if (f[13] <= -0.000635) {
              return -0.040457;
            } else {
              return 0.021825;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[18] <= 0.000000) {
            if (f[21] <= 0.000668) {
              return 0.014828;
            } else {
              return -0.069204;
            }
          } else {
            if (f[1] <= -0.344689) {
              return -0.141978;
            } else {
              return -0.026601;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042721;
            } else {
              return 0.015562;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.033690;
            } else {
              return -0.035694;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[61] <= 0.693009) {
        if (f[61] <= 0.436023) {
          if (f[61] <= 0.035152) {
            return 0.043010;
          } else {
            if (f[56] <= 0.101665) {
              return 0.012662;
            } else {
              return -0.118587;
            }
          }
        } else {
          if (f[3] <= 0.001198) {
            if (f[55] <= 0.379543) {
              return 0.037041;
            } else {
              return -0.030608;
            }
          } else {
            if (f[59] <= -0.540907) {
              return -0.011224;
            } else {
              return -0.091636;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[18] <= 0.000000) {
            if (f[21] <= 0.000668) {
              return 0.015424;
            } else {
              return -0.062666;
            }
          } else {
            if (f[24] <= 0.558333) {
              return -0.024165;
            } else {
              return -0.139115;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042599;
            } else {
              return 0.015148;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.033283;
            } else {
              return -0.033244;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000062) {
          if (f[61] <= 0.501183) {
            if (f[54] <= -0.117085) {
              return 0.013646;
            } else {
              return 0.043744;
            }
          } else {
            if (f[57] <= -0.264961) {
              return -0.030186;
            } else {
              return -0.127154;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            return 0.042884;
          } else {
            if (f[0] <= 44.498876) {
              return -0.065000;
            } else {
              return 0.007460;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[30] <= -0.624909) {
            if (f[7] <= -0.000172) {
              return -0.019730;
            } else {
              return -0.148784;
            }
          } else {
            if (f[8] <= 0.000642) {
              return 0.011994;
            } else {
              return -0.030219;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042506;
            } else {
              return 0.014739;
            }
          } else {
            if (f[14] <= 0.000310) {
              return 0.032514;
            } else {
              return -0.014319;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000062) {
          if (f[61] <= 0.501183) {
            if (f[47] <= 0.388580) {
              return 0.043602;
            } else {
              return 0.013021;
            }
          } else {
            if (f[61] <= 0.619145) {
              return -0.128151;
            } else {
              return -0.049997;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            return 0.042765;
          } else {
            if (f[56] <= 0.101665) {
              return 0.001150;
            } else {
              return -0.075222;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[15] <= 0.000584) {
            if (f[14] <= -0.000401) {
              return 0.035035;
            } else {
              return -0.052207;
            }
          } else {
            if (f[42] <= 0.000162) {
              return -0.013492;
            } else {
              return 0.026594;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042402;
            } else {
              return 0.014337;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.032640;
            } else {
              return -0.030557;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[61] <= 0.693009) {
        if (f[61] <= 0.193455) {
          if (f[21] <= -0.000099) {
            if (f[60] <= 0.725200) {
              return 0.042661;
            } else {
              return 0.044377;
            }
          } else {
            return -0.002820;
          }
        } else {
          if (f[3] <= 0.001198) {
            if (f[51] <= -0.120418) {
              return -0.058157;
            } else {
              return 0.019040;
            }
          } else {
            if (f[52] <= 0.599771) {
              return -0.065826;
            } else {
              return -0.003949;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[18] <= 0.000000) {
            if (f[21] <= 0.000668) {
              return 0.015435;
            } else {
              return -0.056891;
            }
          } else {
            if (f[24] <= 0.558333) {
              return -0.020821;
            } else {
              return -0.112152;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042288;
            } else {
              return 0.013941;
            }
          } else {
            if (f[45] <= 0.405408) {
              return -0.044785;
            } else {
              return 0.028531;
            }
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[51] <= -0.090886) {
        if (f[27] <= -2.293496) {
          return -0.088078;
        } else {
          if (f[32] <= 0.884770) {
            if (f[60] <= 0.851117) {
              return -0.014093;
            } else {
              return -0.101776;
            }
          } else {
            if (f[51] <= -0.124779) {
              return 0.014511;
            } else {
              return 0.043504;
            }
          }
        }
      } else {
        if (f[39] <= -0.049817) {
          return -0.092246;
        } else {
          if (f[9] <= 0.000062) {
            if (f[47] <= 0.169927) {
              return -0.007147;
            } else {
              return 0.023869;
            }
          } else {
            if (f[0] <= 52.416644) {
              return 0.008017;
            } else {
              return 0.035446;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[51] <= -0.090886) {
        if (f[27] <= -2.293496) {
          return -0.080285;
        } else {
          if (f[32] <= 0.884770) {
            if (f[53] <= -0.088684) {
              return -0.011880;
            } else {
              return -0.071074;
            }
          } else {
            if (f[51] <= -0.124779) {
              return 0.014107;
            } else {
              return 0.043356;
            }
          }
        }
      } else {
        if (f[39] <= -0.049817) {
          return -0.082006;
        } else {
          if (f[9] <= 0.000062) {
            if (f[53] <= 0.012075) {
              return -0.006882;
            } else {
              return 0.023445;
            }
          } else {
            if (f[0] <= 52.416644) {
              return 0.007750;
            } else {
              return 0.035119;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000060) {
            if (f[60] <= 0.725200) {
              return 0.042540;
            } else {
              return 0.044346;
            }
          } else {
            return -0.016030;
          }
        } else {
          if (f[3] <= 0.001198) {
            if (f[51] <= -0.120418) {
              return -0.057989;
            } else {
              return 0.016615;
            }
          } else {
            if (f[59] <= -0.540907) {
              return -0.002904;
            } else {
              return -0.062352;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[30] <= -0.624909) {
            if (f[47] <= -0.396436) {
              return -0.102339;
            } else {
              return 0.009905;
            }
          } else {
            if (f[41] <= 0.000003) {
              return 0.027428;
            } else {
              return -0.015023;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042162;
            } else {
              return 0.013306;
            }
          } else {
            if (f[61] <= 0.729115) {
              return -0.028074;
            } else {
              return 0.029711;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000067) {
          if (f[61] <= 0.501183) {
            if (f[54] <= -0.117085) {
              return 0.012262;
            } else {
              return 0.043761;
            }
          } else {
            if (f[61] <= 0.633538) {
              return -0.103276;
            } else {
              return -0.029182;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            return 0.042481;
          } else {
            if (f[9] <= 0.000155) {
              return -0.003604;
            } else {
              return -0.097850;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[9] <= 0.000089) {
            if (f[3] <= 0.001431) {
              return -0.010727;
            } else {
              return 0.024842;
            }
          } else {
            if (f[56] <= 0.122076) {
              return -0.071240;
            } else {
              return 0.002083;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.042073;
            } else {
              return 0.012927;
            }
          } else {
            if (f[51] <= 0.039579) {
              return 0.004578;
            } else {
              return 0.042566;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[61] <= 0.193455) {
          if (f[21] <= -0.000099) {
            if (f[61] <= 0.117687) {
              return 0.042418;
            } else {
              return 0.044000;
            }
          } else {
            return -0.003021;
          }
        } else {
          if (f[3] <= 0.001198) {
            if (f[55] <= 0.379543) {
              return 0.031979;
            } else {
              return -0.024074;
            }
          } else {
            if (f[9] <= 0.000148) {
              return -0.040620;
            } else {
              return -0.110108;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[9] <= 0.000089) {
            if (f[3] <= 0.001431) {
              return -0.010208;
            } else {
              return 0.024348;
            }
          } else {
            if (f[56] <= 0.122076) {
              return -0.065089;
            } else {
              return 0.002003;
            }
          }
        } else {
          if (f[6] <= 0.000214) {
            if (f[39] <= 0.013453) {
              return 0.007029;
            } else {
              return 0.039350;
            }
          } else {
            if (f[42] <= 0.000136) {
              return 0.042656;
            } else {
              return -0.092931;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[61] <= 0.729115) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000052) {
            if (f[61] <= 0.035152) {
              return 0.042287;
            } else {
              return 0.043596;
            }
          } else {
            return -0.019569;
          }
        } else {
          if (f[9] <= 0.000155) {
            if (f[3] <= 0.001136) {
              return 0.015587;
            } else {
              return -0.034247;
            }
          } else {
            return -0.160817;
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[9] <= 0.000089) {
            if (f[19] <= 1.898353) {
              return 0.009136;
            } else {
              return -0.051386;
            }
          } else {
            if (f[56] <= 0.122076) {
              return -0.063337;
            } else {
              return 0.015229;
            }
          }
        } else {
          if (f[59] <= 0.064859) {
            if (f[41] <= 0.000061) {
              return 0.042014;
            } else {
              return 0.042994;
            }
          } else {
            if (f[56] <= -0.009145) {
              return -0.008823;
            } else {
              return 0.036787;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[61] <= 0.693009) {
        if (f[61] <= 0.436023) {
          if (f[61] <= 0.035152) {
            return 0.042204;
          } else {
            if (f[9] <= 0.000155) {
              return 0.029428;
            } else {
              return -0.066845;
            }
          }
        } else {
          if (f[61] <= 0.578447) {
            if (f[42] <= 0.000062) {
              return 0.002075;
            } else {
              return -0.086266;
            }
          } else {
            if (f[6] <= 0.000174) {
              return 0.012518;
            } else {
              return -0.043281;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[18] <= 0.000000) {
            if (f[53] <= -0.214093) {
              return -0.014205;
            } else {
              return 0.028065;
            }
          } else {
            if (f[53] <= -0.088684) {
              return -0.010373;
            } else {
              return -0.077947;
            }
          }
        } else {
          if (f[6] <= 0.000214) {
            if (f[29] <= 0.014096) {
              return -0.031892;
            } else {
              return 0.039069;
            }
          } else {
            if (f[42] <= 0.000136) {
              return 0.042462;
            } else {
              return -0.079348;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[61] <= 0.729115) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000052) {
            if (f[61] <= 0.035152) {
              return 0.042104;
            } else {
              return 0.043623;
            }
          } else {
            return -0.017382;
          }
        } else {
          if (f[9] <= 0.000155) {
            if (f[9] <= 0.000067) {
              return -0.042118;
            } else {
              return -0.002351;
            }
          } else {
            return -0.132273;
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[13] <= 0.000184) {
            if (f[2] <= 0.908133) {
              return -0.009396;
            } else {
              return -0.069239;
            }
          } else {
            if (f[45] <= 0.551329) {
              return 0.044227;
            } else {
              return 0.005299;
            }
          }
        } else {
          if (f[59] <= 0.064859) {
            if (f[41] <= 0.000061) {
              return 0.041863;
            } else {
              return 0.042752;
            }
          } else {
            if (f[58] <= -0.140080) {
              return 0.032191;
            } else {
              return -0.048395;
            }
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[51] <= -0.090886) {
        if (f[30] <= -0.700679) {
          if (f[9] <= 0.000147) {
            return -0.088561;
          } else {
            if (f[2] <= 0.274947) {
              return 0.044031;
            } else {
              return -0.010057;
            }
          }
        } else {
          if (f[41] <= 0.000002) {
            if (f[59] <= 0.698812) {
              return 0.026106;
            } else {
              return -0.053030;
            }
          } else {
            if (f[49] <= 0.388690) {
              return -0.010824;
            } else {
              return -0.097562;
            }
          }
        }
      } else {
        if (f[49] <= 0.391975) {
          if (f[55] <= 0.419174) {
            if (f[3] <= 0.001136) {
              return 0.033486;
            } else {
              return 0.003776;
            }
          } else {
            if (f[18] <= -0.000000) {
              return 0.023314;
            } else {
              return -0.128890;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[51] <= -0.065219) {
              return 0.043243;
            } else {
              return 0.041975;
            }
          } else {
            return 0.044197;
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[60] <= 0.596753) {
        if (f[59] <= 0.360931) {
          if (f[60] <= 0.517866) {
            if (f[49] <= 0.391975) {
              return 0.006070;
            } else {
              return 0.043055;
            }
          } else {
            if (f[9] <= 0.000061) {
              return 0.018685;
            } else {
              return -0.133788;
            }
          }
        } else {
          if (f[3] <= 0.001282) {
            return 0.046212;
          } else {
            if (f[44] <= 0.018572) {
              return 0.044342;
            } else {
              return 0.042747;
            }
          }
        }
      } else {
        if (f[30] <= -0.700679) {
          if (f[9] <= 0.000143) {
            return -0.081150;
          } else {
            if (f[2] <= 0.274947) {
              return 0.043986;
            } else {
              return -0.012518;
            }
          }
        } else {
          if (f[31] <= -0.697782) {
            if (f[48] <= -0.478088) {
              return 0.043639;
            } else {
              return 0.017335;
            }
          } else {
            if (f[6] <= 0.000209) {
              return -0.021253;
            } else {
              return 0.017361;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[61] <= 0.436023) {
          if (f[61] <= 0.035152) {
            return 0.041986;
          } else {
            if (f[0] <= 35.310252) {
              return -0.074583;
            } else {
              return 0.022440;
            }
          }
        } else {
          if (f[3] <= 0.000996) {
            if (f[3] <= 0.000837) {
              return -0.022665;
            } else {
              return 0.045206;
            }
          } else {
            if (f[15] <= 0.000435) {
              return -0.014624;
            } else {
              return -0.059151;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[13] <= 0.000182) {
            if (f[12] <= 0.000050) {
              return 0.035120;
            } else {
              return -0.025116;
            }
          } else {
            if (f[51] <= -0.101355) {
              return 0.023063;
            } else {
              return -0.013267;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.041735;
            } else {
              return 0.009067;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.029490;
            } else {
              return -0.038663;
            }
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000052) {
            if (f[61] <= 0.035152) {
              return 0.041888;
            } else {
              return 0.043448;
            }
          } else {
            return -0.016108;
          }
        } else {
          if (f[3] <= 0.001020) {
            if (f[3] <= 0.000798) {
              return -0.051983;
            } else {
              return 0.039789;
            }
          } else {
            if (f[58] <= -0.315153) {
              return -0.066052;
            } else {
              return -0.020195;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[13] <= 0.000187) {
            if (f[19] <= 1.831982) {
              return -0.003507;
            } else {
              return -0.037346;
            }
          } else {
            if (f[3] <= 0.001426) {
              return 0.013573;
            } else {
              return 0.044219;
            }
          }
        } else {
          if (f[61] <= 0.752313) {
            if (f[54] <= 0.087669) {
              return 0.041729;
            } else {
              return -0.096235;
            }
          } else {
            if (f[0] <= 100.000000) {
              return 0.040398;
            } else {
              return 0.017050;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[61] <= 0.436023) {
          if (f[15] <= 0.000619) {
            if (f[57] <= 0.505411) {
              return 0.027009;
            } else {
              return -0.048474;
            }
          } else {
            return -0.062548;
          }
        } else {
          if (f[61] <= 0.578447) {
            if (f[42] <= 0.000062) {
              return 0.004880;
            } else {
              return -0.073067;
            }
          } else {
            if (f[6] <= 0.000160) {
              return 0.020113;
            } else {
              return -0.037487;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[9] <= 0.000136) {
            if (f[8] <= 0.000642) {
              return 0.009556;
            } else {
              return -0.019732;
            }
          } else {
            return -0.066723;
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.041647;
            } else {
              return 0.008250;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.028735;
            } else {
              return -0.037226;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000052) {
            if (f[61] <= 0.035152) {
              return 0.041765;
            } else {
              return 0.043216;
            }
          } else {
            return -0.015669;
          }
        } else {
          if (f[3] <= 0.001020) {
            if (f[3] <= 0.000798) {
              return -0.047394;
            } else {
              return 0.039559;
            }
          } else {
            if (f[47] <= -0.380599) {
              return -0.058314;
            } else {
              return -0.018355;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[13] <= 0.000187) {
            if (f[56] <= 0.013900) {
              return -0.085472;
            } else {
              return -0.007112;
            }
          } else {
            if (f[3] <= 0.001426) {
              return 0.013189;
            } else {
              return 0.044113;
            }
          }
        } else {
          if (f[61] <= 0.752313) {
            if (f[54] <= 0.087669) {
              return 0.041608;
            } else {
              return -0.094132;
            }
          } else {
            if (f[42] <= 0.000375) {
              return 0.040307;
            } else {
              return -0.001292;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[61] <= 0.193455) {
          if (f[7] <= -0.000052) {
            if (f[61] <= 0.035152) {
              return 0.041694;
            } else {
              return 0.043081;
            }
          } else {
            return -0.014859;
          }
        } else {
          if (f[3] <= 0.000996) {
            if (f[3] <= 0.000805) {
              return -0.055658;
            } else {
              return 0.044103;
            }
          } else {
            if (f[15] <= 0.000435) {
              return -0.007991;
            } else {
              return -0.045726;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[18] <= 0.000000) {
            if (f[21] <= 0.000668) {
              return 0.015575;
            } else {
              return -0.053338;
            }
          } else {
            if (f[8] <= 0.000999) {
              return -0.009540;
            } else {
              return -0.078561;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[21] <= 0.000701) {
              return 0.041547;
            } else {
              return 0.007399;
            }
          } else {
            if (f[6] <= 0.000214) {
              return 0.027997;
            } else {
              return -0.036395;
            }
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.035152) {
          if (f[60] <= 0.725200) {
            if (f[1] <= -0.841503) {
              return 0.041474;
            } else {
              return 0.042016;
            }
          } else {
            return 0.042691;
          }
        } else {
          if (f[51] <= -0.122971) {
            if (f[41] <= 0.000011) {
              return -0.023913;
            } else {
              return -0.104897;
            }
          } else {
            if (f[9] <= 0.000067) {
              return -0.029820;
            } else {
              return 0.002652;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[13] <= 0.000184) {
            if (f[2] <= 0.908133) {
              return -0.005221;
            } else {
              return -0.055047;
            }
          } else {
            if (f[45] <= 0.551329) {
              return 0.044009;
            } else {
              return 0.007579;
            }
          }
        } else {
          if (f[61] <= 0.752313) {
            if (f[9] <= 0.000060) {
              return -0.079443;
            } else {
              return 0.041629;
            }
          } else {
            if (f[42] <= 0.000375) {
              return 0.040110;
            } else {
              return -0.002572;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[56] <= 0.008746) {
        if (f[2] <= 0.905744) {
          if (f[15] <= 0.000398) {
            if (f[14] <= 0.000031) {
              return 0.005385;
            } else {
              return 0.039224;
            }
          } else {
            if (f[1] <= 2.121492) {
              return -0.010605;
            } else {
              return 0.043955;
            }
          }
        } else {
          if (f[45] <= 0.405408) {
            return -0.022718;
          } else {
            if (f[39] <= 0.610713) {
              return -0.008273;
            } else {
              return 0.043157;
            }
          }
        }
      } else {
        if (f[49] <= 0.391975) {
          if (f[49] <= 0.388690) {
            if (f[3] <= 0.000729) {
              return -0.086464;
            } else {
              return -0.005539;
            }
          } else {
            if (f[3] <= 0.001359) {
              return -0.120952;
            } else {
              return -0.008136;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[51] <= -0.065219) {
              return 0.042938;
            } else {
              return 0.041563;
            }
          } else {
            return 0.044311;
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[61] <= 0.035152) {
            if (f[60] <= 0.725200) {
              return 0.041470;
            } else {
              return 0.042594;
            }
          } else {
            if (f[9] <= 0.000155) {
              return 0.029324;
            } else {
              return -0.056137;
            }
          }
        } else {
          if (f[24] <= 0.108333) {
            if (f[61] <= 0.501183) {
              return -0.075986;
            } else {
              return 0.012903;
            }
          } else {
            if (f[43] <= 0.687522) {
              return -0.067746;
            } else {
              return -0.010649;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[30] <= -0.700679) {
            return -0.062570;
          } else {
            if (f[53] <= -0.088684) {
              return 0.001737;
            } else {
              return -0.051267;
            }
          }
        } else {
          if (f[8] <= 0.000536) {
            if (f[61] <= 0.667139) {
              return 0.014565;
            } else {
              return 0.042396;
            }
          } else {
            if (f[44] <= 0.018572) {
              return 0.023335;
            } else {
              return -0.022940;
            }
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[61] <= 0.729115) {
        if (f[61] <= 0.035152) {
          if (f[54] <= 0.183314) {
            if (f[1] <= -0.841503) {
              return 0.041350;
            } else {
              return 0.041862;
            }
          } else {
            return 0.042487;
          }
        } else {
          if (f[58] <= 0.353418) {
            if (f[9] <= 0.000067) {
              return -0.039175;
            } else {
              return -0.007204;
            }
          } else {
            if (f[46] <= 0.152880) {
              return -0.002960;
            } else {
              return 0.045019;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[9] <= 0.000089) {
            if (f[21] <= 0.000528) {
              return 0.036260;
            } else {
              return -0.003321;
            }
          } else {
            if (f[56] <= 0.122076) {
              return -0.047168;
            } else {
              return 0.017273;
            }
          }
        } else {
          if (f[20] <= 0.002582) {
            if (f[21] <= 0.000638) {
              return 0.041365;
            } else {
              return -0.092661;
            }
          } else {
            if (f[21] <= 0.000660) {
              return 0.039791;
            } else {
              return 0.022451;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[14] <= 0.000317) {
            if (f[39] <= 0.225832) {
              return -0.003634;
            } else {
              return 0.042420;
            }
          } else {
            return -0.062834;
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[61] <= 0.578447) {
              return -0.061436;
            } else {
              return -0.024186;
            }
          } else {
            if (f[15] <= 0.000590) {
              return 0.044289;
            } else {
              return -0.038921;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[1] <= -0.386112) {
            if (f[15] <= 0.000576) {
              return -0.074056;
            } else {
              return 0.015149;
            }
          } else {
            if (f[42] <= 0.000200) {
              return -0.010502;
            } else {
              return 0.025713;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[61] <= 0.680970) {
              return 0.018268;
            } else {
              return 0.039675;
            }
          } else {
            if (f[8] <= 0.000536) {
              return 0.033310;
            } else {
              return -0.021376;
            }
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.035152) {
          if (f[60] <= 0.725200) {
            if (f[1] <= -0.841503) {
              return 0.041258;
            } else {
              return 0.041793;
            }
          } else {
            return 0.042290;
          }
        } else {
          if (f[51] <= -0.122971) {
            if (f[42] <= 0.000200) {
              return -0.083205;
            } else {
              return -0.023902;
            }
          } else {
            if (f[0] <= 87.406996) {
              return 0.001835;
            } else {
              return -0.024527;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[13] <= 0.000184) {
            if (f[46] <= -0.162679) {
              return 0.005340;
            } else {
              return -0.025755;
            }
          } else {
            if (f[45] <= 0.551329) {
              return 0.043882;
            } else {
              return 0.007934;
            }
          }
        } else {
          if (f[59] <= 0.064859) {
            if (f[25] <= 0.900000) {
              return 0.041193;
            } else {
              return 0.041760;
            }
          } else {
            if (f[61] <= 0.764204) {
              return -0.031637;
            } else {
              return 0.033511;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[15] <= 0.000621) {
            if (f[56] <= 0.115352) {
              return 0.030817;
            } else {
              return -0.021458;
            }
          } else {
            return -0.062330;
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[61] <= 0.578447) {
              return -0.056377;
            } else {
              return -0.022094;
            }
          } else {
            if (f[6] <= 0.000155) {
              return 0.044112;
            } else {
              return -0.035739;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[1] <= -0.386112) {
            if (f[47] <= -0.396301) {
              return -0.071592;
            } else {
              return -0.010080;
            }
          } else {
            if (f[42] <= 0.000200) {
              return -0.009866;
            } else {
              return 0.025301;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[61] <= 0.680970) {
              return 0.018202;
            } else {
              return 0.039483;
            }
          } else {
            if (f[8] <= 0.000536) {
              return 0.032831;
            } else {
              return -0.020640;
            }
          }
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[56] <= 0.008746) {
        if (f[2] <= 0.905744) {
          if (f[15] <= 0.000398) {
            if (f[14] <= 0.000031) {
              return 0.003657;
            } else {
              return 0.038883;
            }
          } else {
            if (f[7] <= 0.000588) {
              return -0.010829;
            } else {
              return 0.044711;
            }
          }
        } else {
          if (f[38] <= 1.824100) {
            if (f[44] <= 0.018571) {
              return -0.027833;
            } else {
              return 0.032885;
            }
          } else {
            return 0.044160;
          }
        }
      } else {
        if (f[18] <= 0.000000) {
          if (f[57] <= 0.415381) {
            if (f[27] <= 3.339498) {
              return 0.040800;
            } else {
              return -0.017904;
            }
          } else {
            if (f[8] <= 0.000945) {
              return -0.013953;
            } else {
              return 0.044418;
            }
          }
        } else {
          if (f[8] <= 0.000903) {
            if (f[9] <= 0.000105) {
              return 0.007135;
            } else {
              return -0.031903;
            }
          } else {
            if (f[36] <= 0.551895) {
              return -0.027739;
            } else {
              return -0.101793;
            }
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[49] <= 0.388690) {
          if (f[60] <= 0.596753) {
            if (f[59] <= 0.360931) {
              return 0.004962;
            } else {
              return 0.044960;
            }
          } else {
            if (f[30] <= -0.700679) {
              return -0.038787;
            } else {
              return -0.004095;
            }
          }
        } else {
          if (f[18] <= -0.000000) {
            if (f[13] <= 0.000179) {
              return 0.007528;
            } else {
              return 0.043750;
            }
          } else {
            return -0.083182;
          }
        }
      } else {
        if (f[18] <= 0.000000) {
          if (f[51] <= -0.065219) {
            if (f[45] <= 0.585211) {
              return 0.042340;
            } else {
              return 0.042785;
            }
          } else {
            if (f[48] <= -0.221622) {
              return 0.041251;
            } else {
              return 0.042250;
            }
          }
        } else {
          return 0.044069;
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[61] <= 0.729115) {
        if (f[61] <= 0.035152) {
          if (f[59] <= 0.581805) {
            if (f[1] <= -0.841503) {
              return 0.041170;
            } else {
              return 0.041700;
            }
          } else {
            return 0.042421;
          }
        } else {
          if (f[58] <= 0.353418) {
            if (f[0] <= 87.406996) {
              return -0.006350;
            } else {
              return -0.033361;
            }
          } else {
            if (f[44] <= 0.018573) {
              return 0.045482;
            } else {
              return -0.005326;
            }
          }
        }
      } else {
        if (f[58] <= -0.288030) {
          if (f[13] <= 0.000184) {
            if (f[2] <= 0.908133) {
              return -0.003486;
            } else {
              return -0.049608;
            }
          } else {
            if (f[45] <= 0.551329) {
              return 0.043736;
            } else {
              return 0.005761;
            }
          }
        } else {
          if (f[59] <= 0.064859) {
            if (f[41] <= 0.000061) {
              return 0.041253;
            } else {
              return 0.042366;
            }
          } else {
            if (f[8] <= 0.001160) {
              return 0.026749;
            } else {
              return -0.086966;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[15] <= 0.000621) {
            if (f[56] <= 0.115352) {
              return 0.030207;
            } else {
              return -0.020045;
            }
          } else {
            return -0.067063;
          }
        } else {
          if (f[24] <= 0.108333) {
            if (f[61] <= 0.543213) {
              return -0.051488;
            } else {
              return 0.020611;
            }
          } else {
            if (f[19] <= 1.842439) {
              return -0.055381;
            } else {
              return 0.004151;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[1] <= -0.386112) {
            if (f[15] <= 0.000576) {
              return -0.062841;
            } else {
              return 0.016627;
            }
          } else {
            if (f[4] <= 0.000000) {
              return 0.028466;
            } else {
              return -0.008353;
            }
          }
        } else {
          if (f[8] <= 0.000536) {
            if (f[61] <= 0.667139) {
              return 0.012831;
            } else {
              return 0.042170;
            }
          } else {
            if (f[42] <= 0.000136) {
              return 0.023667;
            } else {
              return -0.026843;
            }
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.035152) {
          if (f[59] <= 0.581805) {
            if (f[1] <= -0.841503) {
              return 0.041103;
            } else {
              return 0.041589;
            }
          } else {
            return 0.042368;
          }
        } else {
          if (f[51] <= -0.122971) {
            if (f[41] <= 0.000011) {
              return -0.014625;
            } else {
              return -0.079531;
            }
          } else {
            if (f[61] <= 0.630253) {
              return -0.018474;
            } else {
              return 0.005726;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[13] <= 0.000187) {
            if (f[38] <= 0.544909) {
              return 0.017280;
            } else {
              return -0.013719;
            }
          } else {
            if (f[32] <= -0.009042) {
              return -0.001830;
            } else {
              return 0.034135;
            }
          }
        } else {
          if (f[59] <= 0.064859) {
            if (f[6] <= 0.000214) {
              return 0.041111;
            } else {
              return 0.041845;
            }
          } else {
            if (f[1] <= 2.048423) {
              return 0.025842;
            } else {
              return -0.100630;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[61] <= 0.736921) {
        if (f[61] <= 0.035152) {
          if (f[59] <= 0.581805) {
            if (f[1] <= -0.841503) {
              return 0.041058;
            } else {
              return 0.041525;
            }
          } else {
            return 0.042271;
          }
        } else {
          if (f[3] <= 0.001020) {
            if (f[3] <= 0.000798) {
              return -0.038254;
            } else {
              return 0.039989;
            }
          } else {
            if (f[58] <= -0.315153) {
              return -0.044734;
            } else {
              return -0.011097;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[13] <= 0.000187) {
            if (f[8] <= 0.000642) {
              return 0.004732;
            } else {
              return -0.021158;
            }
          } else {
            if (f[3] <= 0.001426) {
              return 0.010493;
            } else {
              return 0.044045;
            }
          }
        } else {
          if (f[61] <= 0.752313) {
            if (f[9] <= 0.000060) {
              return -0.091510;
            } else {
              return 0.041254;
            }
          } else {
            if (f[42] <= 0.000375) {
              return 0.039238;
            } else {
              return -0.012132;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[49] <= 0.388690) {
          if (f[60] <= 0.596753) {
            if (f[59] <= 0.360931) {
              return 0.004310;
            } else {
              return 0.045015;
            }
          } else {
            if (f[38] <= 0.000000) {
              return 0.035323;
            } else {
              return -0.011665;
            }
          }
        } else {
          if (f[3] <= 0.001359) {
            return -0.090212;
          } else {
            if (f[19] <= 1.828293) {
              return 0.045319;
            } else {
              return -0.066864;
            }
          }
        }
      } else {
        if (f[25] <= 0.900000) {
          if (f[51] <= -0.065219) {
            if (f[45] <= 0.585211) {
              return 0.041977;
            } else {
              return 0.042594;
            }
          } else {
            if (f[53] <= -0.028659) {
              return 0.041019;
            } else {
              return 0.041497;
            }
          }
        } else {
          return 0.043887;
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[15] <= 0.000621) {
            if (f[56] <= 0.115352) {
              return 0.029777;
            } else {
              return -0.019357;
            }
          } else {
            return -0.059786;
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[14] <= 0.000312) {
              return -0.039180;
            } else {
              return 0.009764;
            }
          } else {
            if (f[15] <= 0.000590) {
              return 0.043976;
            } else {
              return -0.031156;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[1] <= -0.386112) {
            if (f[45] <= 0.650001) {
              return -0.021357;
            } else {
              return -0.080530;
            }
          } else {
            if (f[4] <= 0.000000) {
              return 0.027946;
            } else {
              return -0.007274;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[61] <= 0.680970) {
              return 0.017070;
            } else {
              return 0.038982;
            }
          } else {
            if (f[8] <= 0.000536) {
              return 0.031317;
            } else {
              return -0.021826;
            }
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[61] <= 0.752313) {
        if (f[3] <= 0.001136) {
          if (f[3] <= 0.000798) {
            return -0.029548;
          } else {
            if (f[9] <= 0.000114) {
              return 0.044120;
            } else {
              return 0.004854;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            if (f[59] <= 0.581805) {
              return 0.041046;
            } else {
              return 0.042246;
            }
          } else {
            if (f[59] <= -0.540907) {
              return 0.016605;
            } else {
              return -0.024174;
            }
          }
        }
      } else {
        if (f[47] <= -0.376568) {
          if (f[19] <= 1.898353) {
            if (f[59] <= 0.260015) {
              return -0.060243;
            } else {
              return 0.005866;
            }
          } else {
            if (f[10] <= 0.000058) {
              return -0.087751;
            } else {
              return 0.020345;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[45] <= 0.362860) {
              return -0.014174;
            } else {
              return 0.041110;
            }
          } else {
            if (f[20] <= 0.002584) {
              return 0.041632;
            } else {
              return -0.081727;
            }
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[49] <= 0.388690) {
          if (f[60] <= 0.596753) {
            if (f[59] <= 0.360931) {
              return 0.003960;
            } else {
              return 0.044921;
            }
          } else {
            if (f[39] <= 2.291926) {
              return -0.005354;
            } else {
              return -0.067517;
            }
          }
        } else {
          if (f[18] <= -0.000000) {
            if (f[13] <= 0.000179) {
              return 0.003302;
            } else {
              return 0.043619;
            }
          } else {
            return -0.070147;
          }
        }
      } else {
        if (f[25] <= 0.900000) {
          if (f[51] <= -0.065219) {
            if (f[45] <= 0.599609) {
              return 0.041817;
            } else {
              return 0.042520;
            }
          } else {
            if (f[59] <= 0.226816) {
              return 0.041425;
            } else {
              return 0.040921;
            }
          }
        } else {
          return 0.043743;
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[61] <= 0.686903) {
        if (f[9] <= 0.000062) {
          if (f[61] <= 0.501183) {
            return 0.034816;
          } else {
            if (f[19] <= 1.831117) {
              return -0.061584;
            } else {
              return -0.004213;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            if (f[60] <= 0.731151) {
              return 0.040999;
            } else {
              return 0.042165;
            }
          } else {
            if (f[0] <= 35.310252) {
              return -0.051302;
            } else {
              return 0.004944;
            }
          }
        }
      } else {
        if (f[51] <= -0.065219) {
          if (f[14] <= -0.000401) {
            if (f[45] <= 0.613128) {
              return 0.045083;
            } else {
              return 0.015686;
            }
          } else {
            if (f[6] <= 0.000155) {
              return -0.031827;
            } else {
              return 0.004380;
            }
          }
        } else {
          if (f[29] <= 0.003385) {
            return -0.075510;
          } else {
            if (f[6] <= 0.000214) {
              return 0.036392;
            } else {
              return -0.002275;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[49] <= 0.388690) {
          if (f[61] <= 0.752313) {
            if (f[3] <= 0.001020) {
              return 0.021267;
            } else {
              return -0.012818;
            }
          } else {
            if (f[51] <= -0.098925) {
              return -0.000551;
            } else {
              return 0.035038;
            }
          }
        } else {
          if (f[18] <= -0.000000) {
            if (f[43] <= 0.013386) {
              return 0.006317;
            } else {
              return 0.043884;
            }
          } else {
            return -0.064775;
          }
        }
      } else {
        if (f[25] <= 0.900000) {
          if (f[51] <= -0.065219) {
            if (f[45] <= 0.599609) {
              return 0.041735;
            } else {
              return 0.042426;
            }
          } else {
            if (f[59] <= 0.226816) {
              return 0.041355;
            } else {
              return 0.040857;
            }
          }
        } else {
          return 0.043598;
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[58] <= 0.353418) {
          if (f[49] <= 0.388690) {
            if (f[42] <= 0.000006) {
              return 0.016120;
            } else {
              return -0.004150;
            }
          } else {
            if (f[18] <= -0.000000) {
              return 0.028116;
            } else {
              return -0.060376;
            }
          }
        } else {
          if (f[42] <= 0.000005) {
            return -0.039485;
          } else {
            if (f[9] <= 0.000058) {
              return 0.047776;
            } else {
              return 0.042759;
            }
          }
        }
      } else {
        if (f[25] <= 0.900000) {
          if (f[51] <= -0.065219) {
            if (f[13] <= 0.000183) {
              return 0.042192;
            } else {
              return 0.041771;
            }
          } else {
            if (f[59] <= 0.226816) {
              return 0.041300;
            } else {
              return 0.040822;
            }
          }
        } else {
          return 0.043447;
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[61] <= 0.641189) {
        if (f[61] <= 0.436023) {
          if (f[14] <= 0.000317) {
            if (f[39] <= 0.225832) {
              return -0.003970;
            } else {
              return 0.042289;
            }
          } else {
            return -0.057938;
          }
        } else {
          if (f[9] <= 0.000073) {
            if (f[41] <= 0.000056) {
              return -0.054844;
            } else {
              return -0.002523;
            }
          } else {
            if (f[61] <= 0.529786) {
              return -0.053263;
            } else {
              return 0.017630;
            }
          }
        }
      } else {
        if (f[51] <= -0.090886) {
          if (f[1] <= -0.386112) {
            if (f[47] <= -0.396623) {
              return -0.059505;
            } else {
              return -0.005553;
            }
          } else {
            if (f[27] <= 0.329157) {
              return 0.044727;
            } else {
              return -0.003714;
            }
          }
        } else {
          if (f[25] <= 0.900000) {
            if (f[49] <= 0.254273) {
              return 0.042901;
            } else {
              return 0.024884;
            }
          } else {
            if (f[8] <= 0.000654) {
              return 0.023900;
            } else {
              return -0.026127;
            }
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[49] <= 0.391975) {
        if (f[58] <= 0.353418) {
          if (f[61] <= 0.641189) {
            if (f[9] <= 0.000062) {
              return -0.041484;
            } else {
              return -0.002395;
            }
          } else {
            if (f[47] <= -0.376568) {
              return -0.005525;
            } else {
              return 0.020971;
            }
          }
        } else {
          if (f[42] <= 0.000005) {
            return -0.036092;
          } else {
            if (f[61] <= 0.693009) {
              return 0.044820;
            } else {
              return 0.041185;
            }
          }
        }
      } else {
        if (f[25] <= 0.900000) {
          if (f[50] <= 0.106035) {
            if (f[59] <= 0.226816) {
              return 0.041244;
            } else {
              return 0.040683;
            }
          } else {
            if (f[45] <= 0.590357) {
              return 0.041537;
            } else {
              return 0.042092;
            }
          }
        } else {
          return 0.043313;
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[61] <= 0.752313) {
        if (f[3] <= 0.001020) {
          if (f[3] <= 0.000798) {
            return -0.030308;
          } else {
            if (f[51] <= -0.122971) {
              return 0.007594;
            } else {
              return 0.043128;
            }
          }
        } else {
          if (f[61] <= 0.035152) {
            if (f[48] <= -0.519385) {
              return 0.041901;
            } else {
              return 0.040925;
            }
          } else {
            if (f[58] <= 0.353418) {
              return -0.018425;
            } else {
              return 0.028366;
            }
          }
        }
      } else {
        if (f[56] <= 0.010215) {
          if (f[45] <= 0.355017) {
            return -0.019695;
          } else {
            if (f[43] <= 0.001879) {
              return 0.015040;
            } else {
              return 0.041051;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[29] <= 1.306789) {
              return 0.030826;
            } else {
              return -0.002505;
            }
          } else {
            return -0.060152;
          }
        }
      }
    })(f)
  ];
  const metaSum = metaScores.reduce((a,b) => a+b, 0);
  const metaConf = 1 / (1 + Math.exp(-metaSum));
  
  if (metaConf < 0.60) return {action: "HOLD", confidence: 0, reason: `meta:${metaConf.toFixed(2)}`};
  
  const action = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return {action, confidence, reason: `ML:CRASH1000 prob:${mlProb.toFixed(2)} meta:${metaConf.toFixed(2)}`};
}


// ── ML Model: frxUSDJPY ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: 150, Meta trees: 300
function predict_frxUSDJPY(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[13] <= 0.072247) {
          return 0.105316;
        } else {
          if (f[12] <= 0.119617) {
            return -0.050962;
          } else {
            if (f[13] <= 0.703041) {
              if (f[9] <= 0.487156) {
                if (f[9] <= 0.465625) {
                  return 0.061448;
                } else {
                  return -0.001042;
                }
              } else {
                return 0.106004;
              }
            } else {
              return -0.028308;
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[11] <= -0.423065) {
            if (f[8] <= -0.000066) {
              return -0.053569;
            } else {
              return -0.113169;
            }
          } else {
            if (f[15] <= -0.000072) {
              return 0.041304;
            } else {
              if (f[33] <= 0.041667) {
                if (f[1] <= 0.004439) {
                  return -0.044431;
                } else {
                  return -0.106794;
                }
              } else {
                if (f[26] <= 20.510733) {
                  return 0.029265;
                } else {
                  return -0.043681;
                }
              }
            }
          }
        } else {
          return 0.053018;
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[13] <= 0.072247) {
          return 0.097167;
        } else {
          if (f[12] <= 0.119617) {
            return -0.046916;
          } else {
            if (f[21] <= 0.250008) {
              if (f[11] <= 0.180301) {
                if (f[21] <= 0.190595) {
                  return 0.051213;
                } else {
                  return -0.054086;
                }
              } else {
                return -0.053744;
              }
            } else {
              if (f[12] <= 1.003585) {
                return 0.127184;
              } else {
                if (f[4] <= 0.000000) {
                  return 0.069551;
                } else {
                  return 0.013936;
                }
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[6] <= 0.000087) {
            if (f[11] <= -0.423065) {
              return -0.075551;
            } else {
              if (f[6] <= 0.000063) {
                if (f[6] <= 0.000051) {
                  return 0.054909;
                } else {
                  return -0.097341;
                }
              } else {
                return 0.042275;
              }
            }
          } else {
            if (f[3] <= 0.000102) {
              return -0.126536;
            } else {
              if (f[11] <= 0.336331) {
                if (f[26] <= 20.480418) {
                  return -0.027348;
                } else {
                  return -0.126705;
                }
              } else {
                return 0.001897;
              }
            }
          }
        } else {
          return 0.048811;
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[11] <= 0.180301) {
          if (f[9] <= 0.474479) {
            if (f[11] <= -0.139582) {
              if (f[6] <= 0.000104) {
                return -0.017018;
              } else {
                return 0.077553;
              }
            } else {
              return 0.111975;
            }
          } else {
            if (f[12] <= 1.003585) {
              return 0.040064;
            } else {
              return -0.032439;
            }
          }
        } else {
          if (f[9] <= 0.487156) {
            if (f[21] <= 0.214888) {
              return -0.097617;
            } else {
              return 0.011531;
            }
          } else {
            return 0.058252;
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[6] <= 0.000087) {
            if (f[11] <= -0.423065) {
              return -0.069877;
            } else {
              if (f[11] <= -0.098575) {
                return 0.062616;
              } else {
                if (f[3] <= 0.000087) {
                  return 0.027577;
                } else {
                  return -0.041742;
                }
              }
            }
          } else {
            if (f[3] <= 0.000102) {
              return -0.117212;
            } else {
              if (f[18] <= 0.000000) {
                return -0.085532;
              } else {
                return -0.012453;
              }
            }
          }
        } else {
          return 0.044995;
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[13] <= 0.727346) {
        if (f[8] <= -0.000112) {
          if (f[21] <= 0.150861) {
            if (f[23] <= 0.000000) {
              return -0.043350;
            } else {
              return 0.044161;
            }
          } else {
            if (f[28] <= 0.002583) {
              return 0.099358;
            } else {
              return 0.032117;
            }
          }
        } else {
          if (f[20] <= 1.622805) {
            if (f[16] <= 0.000243) {
              if (f[6] <= 0.000043) {
                return 0.063205;
              } else {
                if (f[6] <= 0.000062) {
                  return -0.066429;
                } else {
                  return 0.007028;
                }
              }
            } else {
              if (f[11] <= 0.289166) {
                return -0.104776;
              } else {
                return -0.006665;
              }
            }
          } else {
            if (f[4] <= 0.000157) {
              return 0.002887;
            } else {
              if (f[11] <= 0.051612) {
                return 0.087819;
              } else {
                return 0.023691;
              }
            }
          }
        }
      } else {
        if (f[16] <= -0.000164) {
          return -0.006867;
        } else {
          return -0.080371;
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[13] <= 0.059298) {
          return 0.094078;
        } else {
          if (f[12] <= 0.119617) {
            return -0.036148;
          } else {
            if (f[21] <= 0.250008) {
              if (f[28] <= 0.002583) {
                return -0.055197;
              } else {
                if (f[28] <= 0.002583) {
                  return 0.085584;
                } else {
                  return -0.006848;
                }
              }
            } else {
              if (f[12] <= 1.003585) {
                return 0.101977;
              } else {
                if (f[28] <= 0.002583) {
                  return 0.069415;
                } else {
                  return 0.009012;
                }
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[33] <= 0.000000) {
            return -0.095947;
          } else {
            if (f[13] <= 0.143713) {
              if (f[27] <= 11.199463) {
                return 0.080858;
              } else {
                return -0.061767;
              }
            } else {
              if (f[1] <= 0.019863) {
                if (f[26] <= 20.478093) {
                  return -0.005770;
                } else {
                  return -0.084210;
                }
              } else {
                return 0.018207;
              }
            }
          }
        } else {
          return 0.041418;
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[33] <= 0.208333) {
        if (f[5] <= -0.000514) {
          return -0.075844;
        } else {
          if (f[16] <= -0.000180) {
            if (f[4] <= 0.000038) {
              if (f[6] <= 0.000095) {
                return 0.023038;
              } else {
                return 0.101361;
              }
            } else {
              return -0.017189;
            }
          } else {
            if (f[8] <= 0.000290) {
              if (f[12] <= 4.576914) {
                if (f[12] <= -0.166723) {
                  return -0.052476;
                } else {
                  return 0.005618;
                }
              } else {
                return -0.085508;
              }
            } else {
              if (f[26] <= 20.531982) {
                return 0.019975;
              } else {
                return 0.085485;
              }
            }
          }
        }
      } else {
        return -0.060204;
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[13] <= 0.059298) {
          return 0.087196;
        } else {
          if (f[26] <= 0.000000) {
            return -0.041189;
          } else {
            if (f[6] <= 0.000094) {
              if (f[13] <= 0.370281) {
                if (f[13] <= 0.179921) {
                  return -0.031567;
                } else {
                  return 0.068224;
                }
              } else {
                return -0.069274;
              }
            } else {
              if (f[26] <= 20.501514) {
                return 0.080232;
              } else {
                if (f[29] <= 0.603575) {
                  return 0.056031;
                } else {
                  return -0.006460;
                }
              }
            }
          }
        }
      } else {
        if (f[11] <= -0.423065) {
          if (f[26] <= 20.508500) {
            if (f[2] <= 0.000517) {
              return -0.055681;
            } else {
              return -0.005996;
            }
          } else {
            return -0.106996;
          }
        } else {
          if (f[30] <= -0.000075) {
            return 0.052454;
          } else {
            if (f[9] <= 0.522803) {
              if (f[6] <= 0.000089) {
                if (f[33] <= 0.041667) {
                  return -0.050221;
                } else {
                  return 0.019653;
                }
              } else {
                if (f[11] <= 0.364100) {
                  return -0.097728;
                } else {
                  return -0.020737;
                }
              }
            } else {
              if (f[9] <= 0.532987) {
                return 0.067971;
              } else {
                return -0.012945;
              }
            }
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[9] <= 0.465451) {
        if (f[11] <= 0.180301) {
          if (f[24] <= 0.750000) {
            return 0.016344;
          } else {
            if (f[9] <= 0.452373) {
              return 0.062531;
            } else {
              return 0.110407;
            }
          }
        } else {
          return -0.036276;
        }
      } else {
        if (f[11] <= -0.399613) {
          if (f[26] <= 20.511810) {
            if (f[9] <= 0.490938) {
              return 0.045454;
            } else {
              if (f[29] <= 0.553136) {
                return -0.058987;
              } else {
                return -0.006356;
              }
            }
          } else {
            return -0.108775;
          }
        } else {
          if (f[33] <= 0.000000) {
            return -0.048784;
          } else {
            if (f[33] <= 0.208333) {
              if (f[33] <= 0.108333) {
                if (f[26] <= 20.497990) {
                  return 0.036814;
                } else {
                  return -0.011832;
                }
              } else {
                if (f[1] <= 0.010982) {
                  return 0.018261;
                } else {
                  return 0.095001;
                }
              }
            } else {
              return -0.051107;
            }
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[13] <= 0.084444) {
          if (f[26] <= 20.498387) {
            return 0.094667;
          } else {
            return 0.028908;
          }
        } else {
          if (f[26] <= 0.000000) {
            return -0.043121;
          } else {
            if (f[9] <= 0.487156) {
              if (f[6] <= 0.000103) {
                if (f[21] <= 0.294225) {
                  return -0.053526;
                } else {
                  return 0.033709;
                }
              } else {
                if (f[26] <= 20.515349) {
                  return 0.073833;
                } else {
                  return -0.013032;
                }
              }
            } else {
              return 0.061040;
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[6] <= 0.000087) {
            if (f[24] <= 0.500000) {
              if (f[9] <= 0.516401) {
                return -0.074661;
              } else {
                return -0.005174;
              }
            } else {
              if (f[33] <= 0.041667) {
                return -0.027673;
              } else {
                return 0.072030;
              }
            }
          } else {
            if (f[3] <= 0.000102) {
              return -0.101624;
            } else {
              if (f[19] <= 0.000000) {
                return -0.068774;
              } else {
                return -0.006973;
              }
            }
          }
        } else {
          return 0.039353;
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[33] <= 0.208333) {
        if (f[8] <= 0.000290) {
          if (f[27] <= 11.190966) {
            if (f[13] <= 0.091719) {
              if (f[6] <= 0.000084) {
                return 0.024046;
              } else {
                return 0.082935;
              }
            } else {
              if (f[27] <= 11.164644) {
                if (f[1] <= -0.000630) {
                  return 0.001566;
                } else {
                  return -0.062593;
                }
              } else {
                if (f[6] <= 0.000101) {
                  return 0.003888;
                } else {
                  return 0.055017;
                }
              }
            }
          } else {
            if (f[21] <= 0.255962) {
              if (f[3] <= 0.000102) {
                if (f[3] <= 0.000082) {
                  return -0.044385;
                } else {
                  return -0.105293;
                }
              } else {
                return -0.006619;
              }
            } else {
              if (f[16] <= 0.000136) {
                return -0.032518;
              } else {
                return 0.043731;
              }
            }
          }
        } else {
          if (f[26] <= 20.531982) {
            return 0.012903;
          } else {
            return 0.076459;
          }
        }
      } else {
        return -0.052067;
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[9] <= 0.465451) {
        if (f[11] <= 0.180301) {
          if (f[24] <= 0.750000) {
            return 0.012098;
          } else {
            if (f[9] <= 0.452373) {
              return 0.054402;
            } else {
              return 0.101866;
            }
          }
        } else {
          return -0.031956;
        }
      } else {
        if (f[11] <= -0.399613) {
          if (f[27] <= 11.187284) {
            if (f[7] <= -0.943634) {
              if (f[16] <= -0.000144) {
                return 0.072291;
              } else {
                return -0.023102;
              }
            } else {
              return -0.049712;
            }
          } else {
            return -0.086435;
          }
        } else {
          if (f[27] <= 11.103331) {
            return -0.043794;
          } else {
            if (f[15] <= -0.000072) {
              return 0.049132;
            } else {
              if (f[11] <= -0.251059) {
                return 0.058288;
              } else {
                if (f[7] <= -0.960390) {
                  return -0.023148;
                } else {
                  return 0.015267;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[9] <= 0.491573) {
        if (f[11] <= 0.180301) {
          if (f[3] <= 0.000101) {
            if (f[27] <= 11.177883) {
              return 0.038272;
            } else {
              return -0.026576;
            }
          } else {
            if (f[12] <= 0.793616) {
              return 0.104513;
            } else {
              if (f[9] <= 0.466779) {
                return 0.064244;
              } else {
                return -0.035891;
              }
            }
          }
        } else {
          if (f[27] <= 11.166919) {
            return -0.068137;
          } else {
            if (f[9] <= 0.472199) {
              return -0.045010;
            } else {
              return 0.049232;
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[6] <= 0.000086) {
            if (f[11] <= -0.423065) {
              return -0.047025;
            } else {
              if (f[3] <= 0.000105) {
                if (f[5] <= -0.000022) {
                  return 0.081558;
                } else {
                  return 0.002570;
                }
              } else {
                return -0.038389;
              }
            }
          } else {
            if (f[3] <= 0.000102) {
              return -0.093875;
            } else {
              if (f[11] <= -0.050854) {
                return -0.059303;
              } else {
                return 0.004130;
              }
            }
          }
        } else {
          return 0.037182;
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[5] <= -0.000543) {
        return -0.060742;
      } else {
        if (f[8] <= -0.000163) {
          if (f[12] <= 0.230967) {
            return 0.089185;
          } else {
            if (f[20] <= -1.413999) {
              return -0.008175;
            } else {
              return 0.064442;
            }
          }
        } else {
          if (f[12] <= -0.166723) {
            if (f[2] <= 0.000429) {
              return -0.020130;
            } else {
              return -0.094915;
            }
          } else {
            if (f[3] <= 0.000102) {
              if (f[2] <= 0.000276) {
                if (f[1] <= 0.000462) {
                  return 0.002242;
                } else {
                  return 0.058132;
                }
              } else {
                if (f[11] <= -0.338101) {
                  return -0.084312;
                } else {
                  return -0.019420;
                }
              }
            } else {
              if (f[3] <= 0.000164) {
                if (f[2] <= 0.000389) {
                  return -0.018689;
                } else {
                  return 0.050929;
                }
              } else {
                if (f[11] <= 0.340012) {
                  return -0.052004;
                } else {
                  return 0.018335;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[9] <= 0.465451) {
        if (f[11] <= 0.180301) {
          if (f[5] <= 0.000094) {
            if (f[11] <= -0.382519) {
              return -0.003150;
            } else {
              return 0.064630;
            }
          } else {
            return 0.092290;
          }
        } else {
          return -0.024777;
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[33] <= 0.000000) {
            return -0.063358;
          } else {
            if (f[26] <= 20.510287) {
              if (f[5] <= 0.000076) {
                if (f[6] <= 0.000109) {
                  return -0.009302;
                } else {
                  return 0.047191;
                }
              } else {
                return 0.066850;
              }
            } else {
              if (f[11] <= -0.399613) {
                return -0.092674;
              } else {
                if (f[5] <= -0.000069) {
                  return 0.040452;
                } else {
                  return -0.022673;
                }
              }
            }
          }
        } else {
          return 0.034131;
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[9] <= 0.491573) {
        if (f[11] <= 0.180301) {
          if (f[6] <= 0.000089) {
            if (f[33] <= 0.041667) {
              return 0.038400;
            } else {
              return -0.025420;
            }
          } else {
            if (f[11] <= -0.391731) {
              if (f[21] <= 0.223702) {
                return -0.021204;
              } else {
                return 0.063436;
              }
            } else {
              if (f[0] <= 50.205518) {
                return 0.129010;
              } else {
                return 0.054488;
              }
            }
          }
        } else {
          if (f[21] <= 0.306736) {
            if (f[2] <= 0.000590) {
              return -0.076670;
            } else {
              return 0.004537;
            }
          } else {
            return 0.036736;
          }
        }
      } else {
        if (f[33] <= 0.191667) {
          if (f[21] <= 0.053303) {
            return 0.060210;
          } else {
            if (f[30] <= -0.000082) {
              return 0.040443;
            } else {
              if (f[6] <= 0.000088) {
                if (f[6] <= 0.000064) {
                  return -0.025384;
                } else {
                  return 0.020595;
                }
              } else {
                if (f[11] <= 0.384405) {
                  return -0.062168;
                } else {
                  return -0.000754;
                }
              }
            }
          }
        } else {
          return -0.075352;
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[5] <= -0.000514) {
        return -0.051657;
      } else {
        if (f[8] <= -0.000163) {
          if (f[11] <= 0.186411) {
            if (f[28] <= 0.002583) {
              return 0.092044;
            } else {
              return 0.012250;
            }
          } else {
            return -0.017670;
          }
        } else {
          if (f[33] <= 0.208333) {
            if (f[5] <= 0.000265) {
              if (f[15] <= -0.000088) {
                return 0.049244;
              } else {
                if (f[21] <= 0.248479) {
                  return -0.036588;
                } else {
                  return 0.003809;
                }
              }
            } else {
              if (f[29] <= 0.586394) {
                return 0.057560;
              } else {
                return 0.011824;
              }
            }
          } else {
            return -0.064730;
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[9] <= 0.465451) {
        if (f[11] <= 0.042926) {
          if (f[18] <= 0.000004) {
            return 0.019631;
          } else {
            return 0.097846;
          }
        } else {
          return -0.015202;
        }
      } else {
        if (f[13] <= 0.425047) {
          if (f[33] <= 0.000000) {
            return -0.039009;
          } else {
            if (f[11] <= 0.539773) {
              if (f[26] <= 20.536659) {
                if (f[13] <= 0.112856) {
                  return 0.046007;
                } else {
                  return -0.002510;
                }
              } else {
                if (f[20] <= 1.677691) {
                  return -0.044649;
                } else {
                  return 0.015526;
                }
              }
            } else {
              return 0.073976;
            }
          }
        } else {
          if (f[21] <= 0.120129) {
            return 0.016188;
          } else {
            if (f[4] <= 0.000006) {
              if (f[28] <= 0.002583) {
                return -0.049496;
              } else {
                return 0.006616;
              }
            } else {
              return -0.078843;
            }
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[12] <= -0.160004) {
        if (f[5] <= -0.000013) {
          return 0.002769;
        } else {
          return -0.075296;
        }
      } else {
        if (f[5] <= -0.000514) {
          return -0.050790;
        } else {
          if (f[3] <= 0.000102) {
            if (f[29] <= 0.620825) {
              if (f[21] <= 0.284122) {
                if (f[8] <= -0.000132) {
                  return 0.045617;
                } else {
                  return -0.046125;
                }
              } else {
                if (f[21] <= 0.456731) {
                  return 0.069698;
                } else {
                  return -0.003641;
                }
              }
            } else {
              if (f[5] <= 0.000072) {
                return -0.077578;
              } else {
                return -0.014328;
              }
            }
          } else {
            if (f[28] <= 0.002583) {
              if (f[21] <= 0.338379) {
                return 0.080910;
              } else {
                return 0.019609;
              }
            } else {
              if (f[9] <= 0.466779) {
                return 0.063642;
              } else {
                if (f[12] <= 0.650685) {
                  return 0.027838;
                } else {
                  return -0.022016;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[6] <= 0.000043) {
        return 0.038328;
      } else {
        if (f[28] <= 0.002583) {
          if (f[21] <= 0.285367) {
            if (f[3] <= 0.000087) {
              if (f[0] <= 44.534532) {
                return -0.049382;
              } else {
                return -0.098426;
              }
            } else {
              return -0.010100;
            }
          } else {
            return 0.023280;
          }
        } else {
          if (f[9] <= 0.466779) {
            if (f[11] <= 0.042926) {
              if (f[29] <= 0.623148) {
                return 0.091545;
              } else {
                return 0.020749;
              }
            } else {
              return -0.011702;
            }
          } else {
            if (f[1] <= -0.023010) {
              return -0.049821;
            } else {
              if (f[1] <= -0.001356) {
                if (f[28] <= 0.002583) {
                  return 0.049014;
                } else {
                  return -0.027182;
                }
              } else {
                if (f[11] <= 0.318490) {
                  return -0.036049;
                } else {
                  return 0.016362;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[12] <= -0.160004) {
        if (f[16] <= 0.000000) {
          return 0.022070;
        } else {
          return -0.071961;
        }
      } else {
        if (f[4] <= -0.000390) {
          return -0.052963;
        } else {
          if (f[2] <= 0.000524) {
            if (f[21] <= 0.250008) {
              if (f[6] <= 0.000052) {
                return 0.008248;
              } else {
                return -0.073390;
              }
            } else {
              if (f[28] <= 0.002583) {
                if (f[32] <= 0.000082) {
                  return -0.007702;
                } else {
                  return 0.045744;
                }
              } else {
                return -0.035667;
              }
            }
          } else {
            if (f[26] <= 20.513999) {
              if (f[3] <= 0.000182) {
                if (f[16] <= -0.000238) {
                  return 0.026446;
                } else {
                  return 0.079359;
                }
              } else {
                return -0.012464;
              }
            } else {
              if (f[11] <= -0.361096) {
                return -0.075495;
              } else {
                if (f[1] <= 0.028014) {
                  return 0.056108;
                } else {
                  return -0.033745;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[5] <= -0.000611) {
        return -0.054386;
      } else {
        if (f[16] <= -0.000180) {
          if (f[4] <= 0.000050) {
            if (f[27] <= 11.143565) {
              return 0.088976;
            } else {
              if (f[20] <= -1.374909) {
                return -0.012519;
              } else {
                return 0.066132;
              }
            }
          } else {
            return -0.030124;
          }
        } else {
          if (f[12] <= 4.576914) {
            if (f[12] <= -0.166723) {
              if (f[5] <= -0.000013) {
                return -0.000528;
              } else {
                return -0.077007;
              }
            } else {
              if (f[2] <= 0.000524) {
                if (f[2] <= 0.000424) {
                  return 0.007246;
                } else {
                  return -0.056595;
                }
              } else {
                if (f[1] <= 0.028014) {
                  return 0.044674;
                } else {
                  return -0.026947;
                }
              }
            }
          } else {
            return -0.054231;
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[15] <= 0.000013) {
        if (f[20] <= 1.399152) {
          if (f[9] <= 0.473884) {
            if (f[6] <= 0.000125) {
              return 0.004213;
            } else {
              return 0.074286;
            }
          } else {
            if (f[11] <= -0.001895) {
              if (f[13] <= 0.093679) {
                return 0.039166;
              } else {
                if (f[26] <= 20.510287) {
                  return -0.011685;
                } else {
                  return -0.085867;
                }
              }
            } else {
              if (f[12] <= 0.268485) {
                return -0.014905;
              } else {
                if (f[2] <= 0.000619) {
                  return 0.010533;
                } else {
                  return 0.078541;
                }
              }
            }
          }
        } else {
          return 0.051457;
        }
      } else {
        if (f[12] <= -0.153823) {
          return -0.065899;
        } else {
          if (f[29] <= 0.627296) {
            if (f[13] <= 0.136387) {
              return 0.064165;
            } else {
              if (f[9] <= 0.496377) {
                if (f[6] <= 0.000101) {
                  return -0.004799;
                } else {
                  return 0.050948;
                }
              } else {
                return -0.046051;
              }
            }
          } else {
            if (f[20] <= 1.622805) {
              if (f[28] <= 0.002583) {
                return -0.091591;
              } else {
                return -0.026390;
              }
            } else {
              return 0.008812;
            }
          }
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[6] <= 0.000044) {
        if (f[28] <= 0.002582) {
          return -0.012465;
        } else {
          return 0.078329;
        }
      } else {
        if (f[6] <= 0.000059) {
          if (f[6] <= 0.000051) {
            return 0.004685;
          } else {
            return -0.065099;
          }
        } else {
          if (f[9] <= 0.466779) {
            if (f[11] <= 0.032641) {
              if (f[14] <= 0.000113) {
                return 0.081685;
              } else {
                return 0.019357;
              }
            } else {
              return -0.022552;
            }
          } else {
            if (f[12] <= 0.941476) {
              if (f[30] <= -0.000082) {
                return 0.061629;
              } else {
                if (f[33] <= 0.000000) {
                  return -0.049739;
                } else {
                  return 0.014159;
                }
              }
            } else {
              if (f[30] <= 0.000025) {
                if (f[9] <= 0.508531) {
                  return -0.023340;
                } else {
                  return 0.024551;
                }
              } else {
                if (f[30] <= 0.000088) {
                  return -0.070574;
                } else {
                  return -0.015261;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[5] <= -0.000611) {
        return -0.052560;
      } else {
        if (f[16] <= -0.000180) {
          if (f[2] <= 0.000917) {
            if (f[14] <= -0.000138) {
              return 0.008605;
            } else {
              if (f[28] <= 0.002583) {
                return 0.029682;
              } else {
                return 0.086812;
              }
            }
          } else {
            return -0.022376;
          }
        } else {
          if (f[12] <= 4.576914) {
            if (f[11] <= 0.473513) {
              if (f[11] <= 0.038763) {
                if (f[13] <= 0.088393) {
                  return 0.042116;
                } else {
                  return -0.011626;
                }
              } else {
                if (f[15] <= -0.000060) {
                  return 0.008041;
                } else {
                  return -0.042536;
                }
              }
            } else {
              if (f[15] <= 0.000019) {
                return 0.067939;
              } else {
                return -0.005545;
              }
            }
          } else {
            return -0.049620;
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[10] <= 0.500216) {
        if (f[6] <= 0.000044) {
          return 0.031402;
        } else {
          if (f[6] <= 0.000059) {
            if (f[6] <= 0.000051) {
              return 0.004084;
            } else {
              return -0.074609;
            }
          } else {
            if (f[5] <= -0.000611) {
              return -0.054034;
            } else {
              if (f[1] <= 0.028014) {
                if (f[7] <= -0.960581) {
                  return -0.013256;
                } else {
                  return 0.017678;
                }
              } else {
                return -0.038713;
              }
            }
          }
        }
      } else {
        return 0.033301;
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[12] <= -0.349172) {
        return -0.043942;
      } else {
        if (f[9] <= 0.534504) {
          if (f[20] <= 1.622805) {
            if (f[17] <= 0.000090) {
              if (f[26] <= 20.536659) {
                if (f[13] <= 0.072247) {
                  return 0.063983;
                } else {
                  return 0.005367;
                }
              } else {
                if (f[18] <= -0.000000) {
                  return 0.021362;
                } else {
                  return -0.046698;
                }
              }
            } else {
              return -0.055071;
            }
          } else {
            if (f[13] <= 0.253067) {
              if (f[1] <= 0.017875) {
                return 0.077245;
              } else {
                return 0.027253;
              }
            } else {
              return 0.002863;
            }
          }
        } else {
          return -0.042116;
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[10] <= 0.500216) {
        if (f[6] <= 0.000044) {
          return 0.028017;
        } else {
          if (f[6] <= 0.000058) {
            if (f[6] <= 0.000051) {
              return 0.003994;
            } else {
              return -0.073364;
            }
          } else {
            if (f[27] <= 0.000000) {
              if (f[21] <= 0.233616) {
                return 0.002780;
              } else {
                return -0.070622;
              }
            } else {
              if (f[28] <= 0.002582) {
                return -0.038931;
              } else {
                if (f[13] <= 0.136387) {
                  return 0.033905;
                } else {
                  return -0.002696;
                }
              }
            }
          }
        }
      } else {
        return 0.031374;
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[12] <= -0.007141) {
          return -0.030900;
        } else {
          if (f[13] <= 0.059298) {
            return 0.078641;
          } else {
            if (f[21] <= 0.302910) {
              if (f[9] <= 0.487156) {
                if (f[6] <= 0.000101) {
                  return -0.045489;
                } else {
                  return 0.012477;
                }
              } else {
                return 0.050639;
              }
            } else {
              if (f[21] <= 0.427100) {
                return 0.070385;
              } else {
                return -0.002333;
              }
            }
          }
        }
      } else {
        if (f[10] <= 0.500216) {
          if (f[14] <= -0.000013) {
            if (f[13] <= 0.154220) {
              return 0.042003;
            } else {
              if (f[13] <= 0.299848) {
                return -0.064866;
              } else {
                return 0.006292;
              }
            }
          } else {
            if (f[20] <= 1.234126) {
              if (f[6] <= 0.000086) {
                return -0.028414;
              } else {
                return -0.093809;
              }
            } else {
              if (f[3] <= 0.000098) {
                return -0.029415;
              } else {
                return 0.028504;
              }
            }
          }
        } else {
          return 0.029004;
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[15] <= 0.000013) {
        if (f[4] <= 0.000069) {
          if (f[14] <= 0.000000) {
            if (f[16] <= -0.000190) {
              if (f[17] <= -0.000142) {
                return -0.003390;
              } else {
                return 0.063165;
              }
            } else {
              if (f[26] <= 20.461730) {
                return -0.048797;
              } else {
                if (f[33] <= 0.041667) {
                  return 0.042327;
                } else {
                  return -0.014282;
                }
              }
            }
          } else {
            if (f[21] <= 0.280211) {
              return -0.057334;
            } else {
              return -0.010323;
            }
          }
        } else {
          if (f[13] <= 0.277573) {
            return 0.064241;
          } else {
            return -0.011997;
          }
        }
      } else {
        if (f[12] <= -0.153823) {
          return -0.059105;
        } else {
          if (f[7] <= -0.929912) {
            if (f[7] <= -0.949751) {
              if (f[11] <= -0.344518) {
                return -0.045983;
              } else {
                if (f[11] <= 0.026958) {
                  return 0.035115;
                } else {
                  return -0.014815;
                }
              }
            } else {
              if (f[26] <= 20.523591) {
                return 0.072954;
              } else {
                return -0.003017;
              }
            }
          } else {
            return -0.056696;
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[17] <= -0.000246) {
        return -0.048463;
      } else {
        if (f[16] <= -0.000559) {
          return 0.064687;
        } else {
          if (f[1] <= -0.023010) {
            return -0.061099;
          } else {
            if (f[8] <= -0.000112) {
              if (f[11] <= 0.347415) {
                if (f[2] <= 0.000668) {
                  return 0.066422;
                } else {
                  return 0.004424;
                }
              } else {
                return -0.010828;
              }
            } else {
              if (f[11] <= 0.473513) {
                if (f[11] <= 0.038763) {
                  return -0.002856;
                } else {
                  return -0.033219;
                }
              } else {
                if (f[18] <= 0.000016) {
                  return 0.002760;
                } else {
                  return 0.076075;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[12] <= -0.349172) {
        return -0.039062;
      } else {
        if (f[9] <= 0.534504) {
          if (f[9] <= 0.522803) {
            if (f[13] <= 0.679772) {
              if (f[16] <= 0.000368) {
                if (f[18] <= 0.000021) {
                  return 0.006763;
                } else {
                  return 0.061939;
                }
              } else {
                if (f[11] <= 0.280705) {
                  return -0.065964;
                } else {
                  return 0.016118;
                }
              }
            } else {
              if (f[17] <= -0.000035) {
                return -0.049479;
              } else {
                return -0.003338;
              }
            }
          } else {
            if (f[13] <= 0.254892) {
              return 0.060196;
            } else {
              return 0.019680;
            }
          }
        } else {
          return -0.038096;
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[9] <= 0.493996) {
        if (f[2] <= 0.000273) {
          return 0.048388;
        } else {
          if (f[2] <= 0.000524) {
            if (f[21] <= 0.302910) {
              if (f[16] <= -0.000045) {
                return -0.027917;
              } else {
                return -0.075098;
              }
            } else {
              return 0.007305;
            }
          } else {
            if (f[11] <= -0.988242) {
              return -0.038014;
            } else {
              if (f[8] <= 0.000103) {
                if (f[16] <= -0.000220) {
                  return 0.027264;
                } else {
                  return 0.083537;
                }
              } else {
                if (f[3] <= 0.000154) {
                  return 0.035061;
                } else {
                  return -0.037247;
                }
              }
            }
          }
        }
      } else {
        if (f[33] <= 0.191667) {
          if (f[10] <= 0.500216) {
            if (f[33] <= 0.000000) {
              return -0.063837;
            } else {
              if (f[15] <= -0.000072) {
                return 0.043868;
              } else {
                if (f[33] <= 0.108333) {
                  return -0.025056;
                } else {
                  return 0.036761;
                }
              }
            }
          } else {
            return 0.040361;
          }
        } else {
          return -0.059173;
        }
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[15] <= 0.000013) {
        if (f[32] <= 0.000082) {
          if (f[15] <= -0.000031) {
            return -0.042549;
          } else {
            if (f[4] <= -0.000107) {
              return -0.044499;
            } else {
              if (f[2] <= 0.000378) {
                return 0.050454;
              } else {
                if (f[27] <= 11.191701) {
                  return 0.022122;
                } else {
                  return -0.030389;
                }
              }
            }
          }
        } else {
          if (f[12] <= 3.275800) {
            if (f[12] <= 0.027191) {
              return 0.000917;
            } else {
              if (f[29] <= 0.579344) {
                return 0.014825;
              } else {
                if (f[23] <= 0.000000) {
                  return 0.047150;
                } else {
                  return 0.097307;
                }
              }
            }
          } else {
            return -0.017535;
          }
        }
      } else {
        if (f[20] <= 2.189638) {
          if (f[1] <= 0.007044) {
            if (f[33] <= 0.091667) {
              if (f[18] <= -0.000012) {
                return -0.030978;
              } else {
                if (f[29] <= 0.510878) {
                  return -0.005947;
                } else {
                  return 0.035804;
                }
              }
            } else {
              return -0.040695;
            }
          } else {
            if (f[12] <= 0.845815) {
              return -0.013016;
            } else {
              return -0.076831;
            }
          }
        } else {
          return 0.030346;
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[5] <= 0.000566) {
        if (f[1] <= 0.028765) {
          if (f[8] <= 0.000295) {
            if (f[9] <= 0.493996) {
              if (f[12] <= -0.007141) {
                return -0.029134;
              } else {
                if (f[13] <= 0.410713) {
                  return 0.028547;
                } else {
                  return -0.007733;
                }
              }
            } else {
              if (f[13] <= 0.143713) {
                if (f[11] <= -0.085924) {
                  return 0.068452;
                } else {
                  return -0.010155;
                }
              } else {
                if (f[26] <= 20.440335) {
                  return 0.025840;
                } else {
                  return -0.039808;
                }
              }
            }
          } else {
            return 0.048829;
          }
        } else {
          return -0.070459;
        }
      } else {
        return 0.037050;
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[8] <= -0.000112) {
        if (f[6] <= 0.000070) {
          return 0.063196;
        } else {
          if (f[6] <= 0.000088) {
            return -0.047740;
          } else {
            if (f[11] <= -1.010080) {
              return -0.035660;
            } else {
              if (f[20] <= -1.691453) {
                return -0.001138;
              } else {
                return 0.065495;
              }
            }
          }
        }
      } else {
        if (f[6] <= 0.000041) {
          return 0.036849;
        } else {
          if (f[3] <= 0.000102) {
            if (f[23] <= 0.000000) {
              if (f[2] <= 0.000319) {
                return -0.006054;
              } else {
                if (f[8] <= 0.000030) {
                  return -0.101732;
                } else {
                  return -0.048398;
                }
              }
            } else {
              if (f[12] <= 0.043846) {
                return -0.023862;
              } else {
                return 0.037220;
              }
            }
          } else {
            if (f[12] <= -0.174702) {
              return -0.066264;
            } else {
              if (f[3] <= 0.000165) {
                if (f[28] <= 0.002584) {
                  return 0.011541;
                } else {
                  return 0.082105;
                }
              } else {
                if (f[2] <= 0.000840) {
                  return 0.003547;
                } else {
                  return -0.046260;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[15] <= 0.000013) {
        if (f[33] <= 0.108333) {
          if (f[29] <= 0.673138) {
            if (f[12] <= 2.986441) {
              if (f[21] <= 0.145249) {
                return -0.040127;
              } else {
                if (f[16] <= -0.000177) {
                  return 0.060576;
                } else {
                  return 0.001263;
                }
              }
            } else {
              return -0.041258;
            }
          } else {
            return 0.038982;
          }
        } else {
          if (f[29] <= 0.664444) {
            return 0.055498;
          } else {
            return -0.014542;
          }
        }
      } else {
        if (f[12] <= -0.153823) {
          return -0.050230;
        } else {
          if (f[29] <= 0.627296) {
            if (f[13] <= 0.136387) {
              return 0.052968;
            } else {
              if (f[0] <= 45.773809) {
                return 0.025160;
              } else {
                if (f[15] <= 0.000069) {
                  return 0.011675;
                } else {
                  return -0.044524;
                }
              }
            }
          } else {
            if (f[26] <= 20.506393) {
              return -0.056547;
            } else {
              return -0.006258;
            }
          }
        }
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[9] <= 0.465451) {
        if (f[3] <= 0.000081) {
          return -0.023638;
        } else {
          if (f[29] <= 0.587123) {
            return 0.070765;
          } else {
            return 0.007448;
          }
        }
      } else {
        if (f[8] <= -0.000112) {
          if (f[6] <= 0.000070) {
            return 0.072408;
          } else {
            if (f[29] <= 0.518265) {
              return -0.048232;
            } else {
              if (f[26] <= 20.464669) {
                return 0.049028;
              } else {
                return -0.020896;
              }
            }
          }
        } else {
          if (f[6] <= 0.000041) {
            return 0.034969;
          } else {
            if (f[11] <= 0.318490) {
              if (f[11] <= 0.018386) {
                if (f[26] <= 20.509323) {
                  return 0.003852;
                } else {
                  return -0.033743;
                }
              } else {
                return -0.066582;
              }
            } else {
              if (f[1] <= 0.016833) {
                if (f[28] <= 0.002583) {
                  return 0.018096;
                } else {
                  return -0.041322;
                }
              } else {
                return 0.056166;
              }
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[6] <= 0.000125) {
        if (f[12] <= 3.556954) {
          if (f[17] <= -0.000105) {
            return 0.043596;
          } else {
            if (f[6] <= 0.000037) {
              return 0.051567;
            } else {
              if (f[21] <= 0.645946) {
                if (f[22] <= 0.000000) {
                  return 0.004295;
                } else {
                  return -0.045607;
                }
              } else {
                return -0.059912;
              }
            }
          }
        } else {
          if (f[14] <= -0.000031) {
            return -0.080483;
          } else {
            return -0.007765;
          }
        }
      } else {
        if (f[9] <= 0.466779) {
          return 0.053153;
        } else {
          if (f[9] <= 0.517457) {
            if (f[6] <= 0.000148) {
              return 0.011371;
            } else {
              return -0.056186;
            }
          } else {
            return 0.045702;
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[33] <= 0.191667) {
        if (f[8] <= 0.000384) {
          if (f[3] <= 0.000182) {
            if (f[3] <= 0.000129) {
              if (f[28] <= 0.002583) {
                if (f[8] <= -0.000135) {
                  return 0.046860;
                } else {
                  return -0.003670;
                }
              } else {
                if (f[26] <= 20.498387) {
                  return -0.004067;
                } else {
                  return -0.062163;
                }
              }
            } else {
              if (f[9] <= 0.464816) {
                return 0.091442;
              } else {
                if (f[7] <= -0.944125) {
                  return 0.037211;
                } else {
                  return -0.016379;
                }
              }
            }
          } else {
            return -0.042117;
          }
        } else {
          return 0.051170;
        }
      } else {
        return -0.026229;
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[1] <= 0.028765) {
        if (f[8] <= 0.000325) {
          if (f[15] <= 0.000013) {
            if (f[16] <= 0.000167) {
              if (f[27] <= 11.190966) {
                if (f[18] <= -0.000001) {
                  return -0.001656;
                } else {
                  return 0.039778;
                }
              } else {
                if (f[18] <= -0.000001) {
                  return -0.000209;
                } else {
                  return -0.065878;
                }
              }
            } else {
              if (f[16] <= 0.000255) {
                return 0.070284;
              } else {
                return 0.014687;
              }
            }
          } else {
            if (f[9] <= 0.501970) {
              if (f[21] <= 0.278329) {
                if (f[6] <= 0.000099) {
                  return -0.050586;
                } else {
                  return 0.011281;
                }
              } else {
                if (f[29] <= 0.582547) {
                  return 0.048505;
                } else {
                  return -0.013105;
                }
              }
            } else {
              if (f[17] <= 0.000039) {
                return 0.001136;
              } else {
                return -0.065349;
              }
            }
          }
        } else {
          return 0.062816;
        }
      } else {
        return -0.026930;
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[29] <= 0.477085) {
        if (f[1] <= 0.005320) {
          if (f[13] <= 0.144905) {
            if (f[6] <= 0.000061) {
              return -0.046627;
            } else {
              return 0.036870;
            }
          } else {
            return -0.054781;
          }
        } else {
          return 0.024422;
        }
      } else {
        if (f[29] <= 0.620825) {
          if (f[28] <= 0.002583) {
            if (f[9] <= 0.497671) {
              if (f[13] <= 0.370281) {
                if (f[15] <= -0.000006) {
                  return 0.092477;
                } else {
                  return 0.038526;
                }
              } else {
                return -0.000743;
              }
            } else {
              if (f[28] <= 0.002583) {
                return -0.031783;
              } else {
                return 0.039699;
              }
            }
          } else {
            if (f[6] <= 0.000127) {
              return -0.050561;
            } else {
              return 0.014544;
            }
          }
        } else {
          if (f[28] <= 0.002584) {
            if (f[11] <= 0.186411) {
              if (f[11] <= -0.050854) {
                if (f[2] <= 0.000664) {
                  return -0.001962;
                } else {
                  return -0.058401;
                }
              } else {
                return 0.052856;
              }
            } else {
              return -0.058974;
            }
          } else {
            if (f[15] <= -0.000044) {
              return 0.064313;
            } else {
              return -0.001863;
            }
          }
        }
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[5] <= 0.000566) {
        if (f[1] <= 0.028014) {
          if (f[18] <= 0.000021) {
            if (f[21] <= 0.248479) {
              if (f[8] <= -0.000158) {
                if (f[6] <= 0.000081) {
                  return 0.058027;
                } else {
                  return -0.006098;
                }
              } else {
                if (f[5] <= -0.000050) {
                  return -0.053206;
                } else {
                  return -0.012343;
                }
              }
            } else {
              if (f[21] <= 0.442980) {
                if (f[29] <= 0.648056) {
                  return 0.013279;
                } else {
                  return 0.055553;
                }
              } else {
                if (f[28] <= 0.002582) {
                  return 0.028971;
                } else {
                  return -0.030155;
                }
              }
            }
          } else {
            if (f[7] <= -0.955638) {
              return 0.005684;
            } else {
              return 0.062350;
            }
          }
        } else {
          return -0.063334;
        }
      } else {
        return 0.032610;
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[10] <= 0.500216) {
        if (f[33] <= 0.000000) {
          if (f[16] <= 0.000009) {
            return 0.002877;
          } else {
            return -0.070082;
          }
        } else {
          if (f[26] <= 20.441976) {
            return 0.041887;
          } else {
            if (f[1] <= 0.000462) {
              if (f[6] <= 0.000095) {
                if (f[6] <= 0.000072) {
                  return -0.013443;
                } else {
                  return -0.064687;
                }
              } else {
                if (f[3] <= 0.000180) {
                  return 0.032700;
                } else {
                  return -0.048853;
                }
              }
            } else {
              if (f[21] <= 0.265906) {
                if (f[30] <= -0.000069) {
                  return 0.051214;
                } else {
                  return -0.015982;
                }
              } else {
                if (f[13] <= 0.107263) {
                  return -0.001643;
                } else {
                  return 0.059313;
                }
              }
            }
          }
        }
      } else {
        return 0.024711;
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[11] <= -0.414283) {
        if (f[27] <= 11.190518) {
          if (f[29] <= 0.545492) {
            return -0.029631;
          } else {
            if (f[29] <= 0.616401) {
              return 0.058479;
            } else {
              if (f[21] <= 0.226267) {
                return -0.014514;
              } else {
                return 0.013654;
              }
            }
          }
        } else {
          return -0.053360;
        }
      } else {
        if (f[6] <= 0.000131) {
          if (f[6] <= 0.000051) {
            if (f[12] <= 0.880921) {
              return -0.015924;
            } else {
              return 0.071056;
            }
          } else {
            if (f[6] <= 0.000059) {
              return -0.056785;
            } else {
              if (f[13] <= 0.136387) {
                if (f[11] <= -0.011492) {
                  return 0.047857;
                } else {
                  return -0.011103;
                }
              } else {
                if (f[6] <= 0.000090) {
                  return -0.001998;
                } else {
                  return -0.044987;
                }
              }
            }
          }
        } else {
          if (f[16] <= 0.000079) {
            return 0.080172;
          } else {
            if (f[11] <= 0.404579) {
              return -0.027369;
            } else {
              return 0.039840;
            }
          }
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[2] <= 0.001650) {
        if (f[7] <= -0.929912) {
          if (f[1] <= 0.028765) {
            if (f[7] <= -0.949751) {
              if (f[28] <= 0.002583) {
                if (f[8] <= -0.000149) {
                  return 0.034938;
                } else {
                  return -0.003589;
                }
              } else {
                if (f[26] <= 20.510287) {
                  return -0.010120;
                } else {
                  return -0.061439;
                }
              }
            } else {
              if (f[20] <= 0.867502) {
                if (f[12] <= 0.793616) {
                  return 0.052615;
                } else {
                  return -0.015934;
                }
              } else {
                return 0.086470;
              }
            }
          } else {
            return -0.043133;
          }
        } else {
          return -0.054749;
        }
      } else {
        return 0.030702;
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[3] <= 0.000102) {
        if (f[21] <= 0.294225) {
          if (f[16] <= -0.000180) {
            return 0.024396;
          } else {
            if (f[14] <= 0.000069) {
              if (f[6] <= 0.000080) {
                if (f[18] <= 0.000004) {
                  return -0.069019;
                } else {
                  return -0.010540;
                }
              } else {
                return -0.082791;
              }
            } else {
              return 0.004699;
            }
          }
        } else {
          if (f[28] <= 0.002583) {
            if (f[11] <= -0.059040) {
              return 0.009129;
            } else {
              return 0.072762;
            }
          } else {
            return -0.014093;
          }
        }
      } else {
        if (f[3] <= 0.000106) {
          return 0.056401;
        } else {
          if (f[12] <= 5.780943) {
            if (f[0] <= 31.245412) {
              return 0.045400;
            } else {
              if (f[12] <= -0.007141) {
                return -0.040860;
              } else {
                if (f[12] <= 0.556573) {
                  return 0.041467;
                } else {
                  return -0.007331;
                }
              }
            }
          } else {
            return -0.036748;
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[33] <= 0.208333) {
        if (f[8] <= 0.000393) {
          if (f[7] <= -0.929485) {
            if (f[2] <= 0.000512) {
              if (f[16] <= -0.000190) {
                return 0.036995;
              } else {
                if (f[26] <= 20.461730) {
                  return -0.057767;
                } else {
                  return -0.001157;
                }
              }
            } else {
              if (f[2] <= 0.000549) {
                return 0.066108;
              } else {
                if (f[11] <= 0.318490) {
                  return -0.004997;
                } else {
                  return 0.039396;
                }
              }
            }
          } else {
            return -0.032586;
          }
        } else {
          return 0.045004;
        }
      } else {
        return -0.027329;
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[1] <= -0.036947) {
        return 0.032587;
      } else {
        if (f[1] <= -0.023010) {
          return -0.044767;
        } else {
          if (f[33] <= 0.208333) {
            if (f[6] <= 0.000171) {
              if (f[5] <= -0.000302) {
                return 0.036196;
              } else {
                if (f[33] <= 0.000000) {
                  return -0.038033;
                } else {
                  return 0.000873;
                }
              }
            } else {
              return 0.051198;
            }
          } else {
            return -0.040021;
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[4] <= 0.000365) {
        if (f[4] <= 0.000245) {
          if (f[26] <= 20.572937) {
            if (f[29] <= 0.457291) {
              if (f[33] <= 0.041667) {
                if (f[18] <= -0.000003) {
                  return -0.017463;
                } else {
                  return 0.029936;
                }
              } else {
                if (f[13] <= 0.126866) {
                  return -0.006779;
                } else {
                  return -0.068463;
                }
              }
            } else {
              if (f[13] <= 0.068683) {
                return 0.050906;
              } else {
                if (f[9] <= 0.491573) {
                  return 0.015916;
                } else {
                  return -0.008961;
                }
              }
            }
          } else {
            return -0.048293;
          }
        } else {
          return 0.039705;
        }
      } else {
        return -0.030840;
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[15] <= 0.000013) {
        if (f[32] <= 0.000082) {
          if (f[15] <= -0.000031) {
            return -0.040306;
          } else {
            if (f[4] <= -0.000107) {
              return -0.041611;
            } else {
              if (f[2] <= 0.000378) {
                return 0.043550;
              } else {
                if (f[27] <= 11.191651) {
                  return 0.024085;
                } else {
                  return -0.026751;
                }
              }
            }
          }
        } else {
          if (f[12] <= 3.275800) {
            if (f[13] <= 0.295439) {
              if (f[4] <= 0.000063) {
                if (f[4] <= -0.000201) {
                  return 0.035961;
                } else {
                  return -0.011752;
                }
              } else {
                return 0.054642;
              }
            } else {
              return 0.062442;
            }
          } else {
            return -0.012306;
          }
        }
      } else {
        if (f[20] <= 2.240588) {
          if (f[16] <= 0.000240) {
            if (f[33] <= 0.091667) {
              if (f[11] <= -0.399613) {
                return -0.018644;
              } else {
                if (f[11] <= 0.032641) {
                  return 0.056208;
                } else {
                  return -0.008230;
                }
              }
            } else {
              return -0.033729;
            }
          } else {
            if (f[11] <= 0.336331) {
              return -0.083418;
            } else {
              return -0.011729;
            }
          }
        } else {
          return 0.026684;
        }
      }
    })(f)
  ];
  const mainSum = mainScores.reduce((a,b) => a+b, 0);
  const mlProb = 1 / (1 + Math.exp(-mainSum));
  const pred = mlProb > 0.5 ? 1 : 0;
  
  // Meta model: should we take this trade?
  const mf = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0, mlProb];
  const metaScores = [
    // Meta Tree 0
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000087) {
            if (f[61] <= 0.480537) {
              return 1.306457;
            } else {
              return 1.247337;
            }
          } else {
            return 1.241331;
          }
        } else {
          if (f[10] <= -0.000164) {
            return 1.266856;
          } else {
            if (f[61] <= 0.478727) {
              return 1.320039;
            } else {
              return 1.303589;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[41] <= -0.000025) {
            if (f[44] <= 0.031024) {
              return 1.231722;
            } else {
              return 1.131178;
            }
          } else {
            if (f[42] <= 0.000041) {
              return 1.196781;
            } else {
              return 1.248113;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[54] <= 0.345697) {
              return 1.288977;
            } else {
              return 1.225030;
            }
          } else {
            if (f[38] <= 1.545744) {
              return 1.321326;
            } else {
              return 1.290278;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[61] <= 0.462382) {
            if (f[43] <= 0.092818) {
              return 0.010232;
            } else {
              return 0.047542;
            }
          } else {
            if (f[1] <= 0.002611) {
              return 0.035409;
            } else {
              return -0.014284;
            }
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[61] <= 0.469705) {
              return 0.032263;
            } else {
              return -0.019602;
            }
          } else {
            if (f[49] <= 0.210395) {
              return 0.046904;
            } else {
              return 0.035832;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[8] <= -0.000409) {
            if (f[61] <= 0.517574) {
              return -0.117098;
            } else {
              return -0.062625;
            }
          } else {
            if (f[3] <= 0.000207) {
              return -0.080871;
            } else {
              return -0.023715;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[57] <= 0.563862) {
              return 0.014598;
            } else {
              return -0.051245;
            }
          } else {
            return 0.043202;
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000087) {
            if (f[61] <= 0.462382) {
              return 0.045597;
            } else {
              return 0.013201;
            }
          } else {
            return -0.031076;
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[1] <= 0.004906) {
              return -0.019807;
            } else {
              return 0.031843;
            }
          } else {
            if (f[61] <= 0.477772) {
              return 0.045534;
            } else {
              return 0.033079;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[41] <= -0.000025) {
            if (f[44] <= 0.031024) {
              return -0.036921;
            } else {
              return -0.120241;
            }
          } else {
            if (f[3] <= 0.000210) {
              return -0.072433;
            } else {
              return -0.022846;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[50] <= 0.030987) {
              return 0.036853;
            } else {
              return -0.009197;
            }
          } else {
            if (f[21] <= 0.000066) {
              return 0.045961;
            } else {
              return 0.013254;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[61] <= 0.462382) {
            if (f[6] <= 0.000076) {
              return 0.046532;
            } else {
              return 0.002800;
            }
          } else {
            if (f[41] <= 0.000004) {
              return 0.027406;
            } else {
              return -0.022417;
            }
          }
        } else {
          if (f[12] <= -0.000104) {
            if (f[61] <= 0.469705) {
              return 0.031237;
            } else {
              return -0.019143;
            }
          } else {
            if (f[49] <= 0.210395) {
              return 0.045782;
            } else {
              return 0.034317;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[61] <= 0.495636) {
            if (f[55] <= 0.408907) {
              return 0.002813;
            } else {
              return -0.061125;
            }
          } else {
            if (f[8] <= 0.000036) {
              return -0.052005;
            } else {
              return -0.010316;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[57] <= 0.563862) {
              return 0.013882;
            } else {
              return -0.047228;
            }
          } else {
            return 0.041932;
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[12] <= -0.000176) {
            return -0.003775;
          } else {
            if (f[19] <= 2.558305) {
              return 0.044148;
            } else {
              return 0.007535;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[46] <= -0.183385) {
              return -0.007689;
            } else {
              return 0.042724;
            }
          } else {
            if (f[5] <= 0.000000) {
              return -0.003196;
            } else {
              return 0.045645;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[61] <= 0.495636) {
            if (f[0] <= 50.811190) {
              return 0.016084;
            } else {
              return -0.022871;
            }
          } else {
            if (f[8] <= 0.000045) {
              return -0.048173;
            } else {
              return -0.009137;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[55] <= 0.210242) {
              return 0.035914;
            } else {
              return -0.008872;
            }
          } else {
            if (f[38] <= 1.545744) {
              return 0.044865;
            } else {
              return 0.011405;
            }
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[14] <= -0.000226) {
          if (f[43] <= 0.513598) {
            if (f[32] <= -0.517736) {
              return 0.033147;
            } else {
              return -0.019597;
            }
          } else {
            if (f[44] <= 0.031024) {
              return 0.013783;
            } else {
              return -0.088057;
            }
          }
        } else {
          if (f[44] <= 0.031022) {
            return 0.028854;
          } else {
            if (f[10] <= -0.000025) {
              return -0.038081;
            } else {
              return -0.100265;
            }
          }
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.054957;
        } else {
          if (f[44] <= 0.031023) {
            if (f[22] <= -2.994229) {
              return -0.082180;
            } else {
              return 0.002667;
            }
          } else {
            if (f[13] <= 0.000151) {
              return 0.021779;
            } else {
              return -0.003332;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[14] <= -0.000226) {
          if (f[43] <= 0.513598) {
            if (f[10] <= -0.000069) {
              return -0.006381;
            } else {
              return 0.042172;
            }
          } else {
            if (f[44] <= 0.031024) {
              return 0.013330;
            } else {
              return -0.081020;
            }
          }
        } else {
          if (f[44] <= 0.031022) {
            return 0.028137;
          } else {
            if (f[9] <= 0.000060) {
              return -0.102433;
            } else {
              return -0.038924;
            }
          }
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.051185;
        } else {
          if (f[10] <= -0.000038) {
            if (f[20] <= 0.002582) {
              return -0.068450;
            } else {
              return -0.001198;
            }
          } else {
            if (f[14] <= 0.000126) {
              return 0.011642;
            } else {
              return -0.002668;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[10] <= -0.000176) {
            return -0.002780;
          } else {
            if (f[19] <= 2.558305) {
              return 0.043455;
            } else {
              return 0.007150;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[46] <= -0.183385) {
              return -0.005333;
            } else {
              return 0.041988;
            }
          } else {
            if (f[5] <= 0.000000) {
              return -0.003262;
            } else {
              return 0.045080;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[61] <= 0.495636) {
            if (f[55] <= 0.408907) {
              return 0.003836;
            } else {
              return -0.053189;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.043325;
            } else {
              return -0.007278;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[54] <= 0.019141) {
              return 0.038518;
            } else {
              return -0.006677;
            }
          } else {
            if (f[21] <= 0.000066) {
              return 0.044263;
            } else {
              return 0.009494;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[12] <= -0.000176) {
            return -0.002665;
          } else {
            if (f[19] <= 2.558305) {
              return 0.042912;
            } else {
              return 0.006895;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[46] <= -0.183385) {
              return -0.005104;
            } else {
              return 0.041421;
            }
          } else {
            if (f[5] <= 0.000000) {
              return -0.003125;
            } else {
              return 0.044542;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[61] <= 0.493935) {
            if (f[55] <= 0.412174) {
              return 0.004535;
            } else {
              return -0.054659;
            }
          } else {
            if (f[8] <= 0.000036) {
              return -0.040940;
            } else {
              return -0.010008;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[54] <= 0.019141) {
              return 0.037872;
            } else {
              return -0.006386;
            }
          } else {
            if (f[21] <= 0.000066) {
              return 0.043741;
            } else {
              return 0.009170;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[49] <= 0.253054) {
          if (f[19] <= 2.558305) {
            if (f[12] <= -0.000176) {
              return 0.005779;
            } else {
              return 0.042712;
            }
          } else {
            return 0.003694;
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[9] <= 0.000043) {
              return -0.006265;
            } else {
              return 0.033370;
            }
          } else {
            if (f[51] <= -0.123769) {
              return 0.025578;
            } else {
              return -0.045338;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[61] <= 0.495636) {
            if (f[0] <= 50.811190) {
              return 0.016123;
            } else {
              return -0.021798;
            }
          } else {
            if (f[8] <= 0.000045) {
              return -0.039983;
            } else {
              return -0.007170;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[3] <= 0.000176) {
              return -0.032930;
            } else {
              return 0.014526;
            }
          } else {
            if (f[38] <= 1.545744) {
              return 0.043240;
            } else {
              return 0.008655;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[10] <= -0.000176) {
            return -0.002686;
          } else {
            if (f[59] <= -0.196802) {
              return 0.025463;
            } else {
              return 0.043736;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[46] <= -0.183385) {
              return -0.005998;
            } else {
              return 0.040610;
            }
          } else {
            if (f[1] <= 0.002611) {
              return 0.037971;
            } else {
              return -0.006179;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496150) {
            if (f[1] <= 0.001012) {
              return 0.015348;
            } else {
              return -0.019818;
            }
          } else {
            if (f[10] <= -0.000082) {
              return -0.067916;
            } else {
              return -0.032374;
            }
          }
        } else {
          if (f[1] <= 0.003335) {
            if (f[61] <= 0.558775) {
              return -0.016189;
            } else {
              return 0.038816;
            }
          } else {
            if (f[29] <= 0.510977) {
              return 0.012748;
            } else {
              return 0.045148;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[49] <= 0.253054) {
          if (f[19] <= 2.558305) {
            if (f[10] <= -0.000176) {
              return 0.005665;
            } else {
              return 0.041735;
            }
          } else {
            return 0.002256;
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[61] <= 0.468464) {
              return 0.038210;
            } else {
              return 0.012515;
            }
          } else {
            if (f[51] <= -0.123769) {
              return 0.024706;
            } else {
              return -0.043296;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[61] <= 0.517574) {
            if (f[61] <= 0.496150) {
              return -0.003804;
            } else {
              return -0.035995;
            }
          } else {
            if (f[1] <= 0.003335) {
              return -0.015419;
            } else {
              return 0.038193;
            }
          }
        } else {
          if (f[21] <= 0.000066) {
            if (f[27] <= -2.894437) {
              return 0.005114;
            } else {
              return 0.047505;
            }
          } else {
            return 0.006032;
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[14] <= -0.000226) {
          if (f[43] <= 0.513598) {
            if (f[32] <= -0.517736) {
              return 0.033984;
            } else {
              return -0.015110;
            }
          } else {
            if (f[44] <= 0.031024) {
              return 0.015681;
            } else {
              return -0.071310;
            }
          }
        } else {
          if (f[10] <= -0.000025) {
            if (f[43] <= 0.087889) {
              return -0.081189;
            } else {
              return -0.009484;
            }
          } else {
            if (f[55] <= -0.223907) {
              return -0.008463;
            } else {
              return -0.095069;
            }
          }
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.046213;
        } else {
          if (f[8] <= -0.000274) {
            if (f[13] <= 0.000157) {
              return -0.003957;
            } else {
              return -0.063472;
            }
          } else {
            if (f[44] <= 0.031023) {
              return 0.002167;
            } else {
              return 0.019539;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[42] <= 0.000143) {
          if (f[41] <= -0.000016) {
            if (f[39] <= 1.358156) {
              return -0.024178;
            } else {
              return -0.083324;
            }
          } else {
            if (f[14] <= -0.000226) {
              return 0.011992;
            } else {
              return -0.036576;
            }
          }
        } else {
          return 0.033331;
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.043360;
        } else {
          if (f[10] <= -0.000075) {
            if (f[41] <= 0.000018) {
              return -0.017545;
            } else {
              return 0.020284;
            }
          } else {
            if (f[14] <= 0.000132) {
              return 0.009252;
            } else {
              return -0.004054;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[10] <= -0.000176) {
            return -0.002605;
          } else {
            if (f[19] <= 2.558305) {
              return 0.040787;
            } else {
              return 0.004676;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[10] <= -0.000044) {
              return -0.004805;
            } else {
              return 0.039734;
            }
          } else {
            if (f[1] <= 0.002611) {
              return 0.037284;
            } else {
              return -0.006780;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[3] <= 0.000200) {
            if (f[21] <= 0.000032) {
              return -0.080041;
            } else {
              return 0.014289;
            }
          } else {
            if (f[41] <= -0.000025) {
              return -0.064704;
            } else {
              return -0.012837;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[55] <= 0.210242) {
              return 0.034222;
            } else {
              return -0.005982;
            }
          } else {
            if (f[21] <= 0.000066) {
              return 0.041876;
            } else {
              return 0.005805;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[49] <= 0.253054) {
          if (f[19] <= 2.558305) {
            if (f[10] <= -0.000176) {
              return 0.005469;
            } else {
              return 0.040656;
            }
          } else {
            return 0.001681;
          }
        } else {
          if (f[59] <= 0.569781) {
            if (f[20] <= 0.002583) {
              return 0.017206;
            } else {
              return 0.044670;
            }
          } else {
            return -0.042082;
          }
        }
      } else {
        if (f[61] <= 0.528374) {
          if (f[61] <= 0.493555) {
            if (f[0] <= 50.811190) {
              return 0.015517;
            } else {
              return -0.015456;
            }
          } else {
            if (f[19] <= 0.909782) {
              return -0.032642;
            } else {
              return -0.007264;
            }
          }
        } else {
          if (f[61] <= 0.558775) {
            if (f[3] <= 0.000200) {
              return -0.037150;
            } else {
              return 0.015160;
            }
          } else {
            if (f[10] <= 0.000019) {
              return 0.044697;
            } else {
              return 0.019013;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[10] <= -0.000176) {
            return -0.002750;
          } else {
            if (f[59] <= -0.196802) {
              return 0.021882;
            } else {
              return 0.041957;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[53] <= -0.156795) {
              return 0.005001;
            } else {
              return 0.042299;
            }
          } else {
            if (f[5] <= 0.000000) {
              return -0.004891;
            } else {
              return 0.042624;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496382) {
            if (f[55] <= 0.408907) {
              return 0.003153;
            } else {
              return -0.044232;
            }
          } else {
            if (f[23] <= 1.795079) {
              return -0.023429;
            } else {
              return -0.050626;
            }
          }
        } else {
          if (f[1] <= 0.003335) {
            if (f[61] <= 0.558775) {
              return -0.012686;
            } else {
              return 0.036675;
            }
          } else {
            if (f[31] <= -0.273042) {
              return 0.006928;
            } else {
              return 0.042554;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[55] <= 0.391133) {
          if (f[10] <= -0.000176) {
            return -0.002636;
          } else {
            if (f[59] <= -0.196802) {
              return 0.021340;
            } else {
              return 0.041530;
            }
          }
        } else {
          if (f[61] <= 0.461333) {
            if (f[46] <= -0.183385) {
              return -0.009003;
            } else {
              return 0.038380;
            }
          } else {
            if (f[5] <= 0.000000) {
              return -0.004681;
            } else {
              return 0.042159;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496382) {
            if (f[48] <= -0.438273) {
              return -0.031971;
            } else {
              return 0.005769;
            }
          } else {
            if (f[8] <= 0.000036) {
              return -0.040029;
            } else {
              return -0.015714;
            }
          }
        } else {
          if (f[1] <= 0.003558) {
            if (f[61] <= 0.558775) {
              return -0.011676;
            } else {
              return 0.036159;
            }
          } else {
            if (f[22] <= -0.055362) {
              return 0.051341;
            } else {
              return 0.024030;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000087) {
            if (f[61] <= 0.461333) {
              return 0.041973;
            } else {
              return 0.011398;
            }
          } else {
            return -0.037098;
          }
        } else {
          if (f[10] <= -0.000157) {
            return -0.006009;
          } else {
            if (f[49] <= 0.368429) {
              return 0.039142;
            } else {
              return 0.013756;
            }
          }
        }
      } else {
        if (f[61] <= 0.528374) {
          if (f[41] <= -0.000025) {
            return -0.073376;
          } else {
            if (f[9] <= 0.000052) {
              return -0.040358;
            } else {
              return -0.011151;
            }
          }
        } else {
          if (f[61] <= 0.560259) {
            if (f[42] <= 0.000041) {
              return -0.041238;
            } else {
              return 0.012525;
            }
          } else {
            if (f[10] <= 0.000019) {
              return 0.043554;
            } else {
              return 0.020831;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000098) {
            if (f[61] <= 0.462382) {
              return 0.040085;
            } else {
              return 0.003776;
            }
          } else {
            return -0.064487;
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[23] <= 1.335681) {
              return 0.029255;
            } else {
              return -0.020837;
            }
          } else {
            if (f[13] <= 0.000138) {
              return 0.039248;
            } else {
              return 0.022263;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496382) {
            if (f[47] <= -0.401336) {
              return -0.075680;
            } else {
              return 0.000865;
            }
          } else {
            if (f[23] <= 1.795079) {
              return -0.020200;
            } else {
              return -0.044647;
            }
          }
        } else {
          if (f[1] <= 0.003335) {
            if (f[61] <= 0.558775) {
              return -0.011229;
            } else {
              return 0.035154;
            }
          } else {
            if (f[29] <= 2.087130) {
              return 0.024327;
            } else {
              return 0.050744;
            }
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[2] <= 0.107856) {
        if (f[58] <= 0.228297) {
          if (f[30] <= -2.089169) {
            if (f[43] <= 0.544112) {
              return 0.046859;
            } else {
              return -0.021647;
            }
          } else {
            if (f[44] <= 0.031022) {
              return 0.029362;
            } else {
              return -0.030734;
            }
          }
        } else {
          if (f[3] <= 0.000365) {
            return -0.007499;
          } else {
            return 0.040209;
          }
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.040812;
        } else {
          if (f[8] <= -0.000274) {
            if (f[3] <= 0.000654) {
              return 0.021028;
            } else {
              return -0.025069;
            }
          } else {
            if (f[44] <= 0.031023) {
              return 0.001623;
            } else {
              return 0.017582;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[58] <= 0.228297) {
          if (f[23] <= -0.152165) {
            if (f[29] <= 3.130071) {
              return 0.039930;
            } else {
              return -0.015960;
            }
          } else {
            if (f[44] <= 0.031022) {
              return 0.029736;
            } else {
              return -0.031377;
            }
          }
        } else {
          if (f[3] <= 0.000365) {
            return -0.005917;
          } else {
            return 0.038633;
          }
        }
      } else {
        if (f[46] <= -0.191764) {
          return -0.038471;
        } else {
          if (f[45] <= 0.288581) {
            if (f[3] <= 0.000246) {
              return -0.022875;
            } else {
              return 0.037058;
            }
          } else {
            if (f[14] <= 0.000132) {
              return 0.005316;
            } else {
              return -0.006308;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[49] <= 0.253054) {
          if (f[19] <= 2.828494) {
            if (f[49] <= -0.364256) {
              return 0.023058;
            } else {
              return 0.043161;
            }
          } else {
            return -0.002408;
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[29] <= 2.523432) {
              return 0.014061;
            } else {
              return 0.045659;
            }
          } else {
            if (f[29] <= 2.594407) {
              return 0.020201;
            } else {
              return -0.056153;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[3] <= 0.000200) {
            if (f[27] <= 0.324961) {
              return -0.069997;
            } else {
              return -0.016692;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.014597;
            } else {
              return 0.008653;
            }
          }
        } else {
          if (f[21] <= 0.000066) {
            if (f[27] <= -2.894437) {
              return -0.002428;
            } else {
              return 0.045710;
            }
          } else {
            return -0.000783;
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[19] <= 2.828494) {
            if (f[49] <= -0.364256) {
              return 0.022518;
            } else {
              return 0.041772;
            }
          } else {
            return -0.002826;
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[39] <= 0.852447) {
              return 0.009260;
            } else {
              return 0.044918;
            }
          } else {
            if (f[37] <= 0.454797) {
              return 0.015423;
            } else {
              return -0.067486;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[3] <= 0.000207) {
            if (f[21] <= 0.000031) {
              return -0.059304;
            } else {
              return 0.011288;
            }
          } else {
            if (f[22] <= -0.806528) {
              return -0.036580;
            } else {
              return -0.006274;
            }
          }
        } else {
          if (f[48] <= -0.697429) {
            if (f[22] <= -0.357025) {
              return -0.058340;
            } else {
              return 0.024638;
            }
          } else {
            if (f[55] <= 0.420381) {
              return 0.031079;
            } else {
              return -0.030439;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000099) {
            if (f[61] <= 0.461333) {
              return 0.040765;
            } else {
              return 0.003577;
            }
          } else {
            return -0.066415;
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[33] <= 3.415980) {
              return -0.010321;
            } else {
              return 0.048002;
            }
          } else {
            if (f[49] <= 0.385216) {
              return 0.036144;
            } else {
              return -0.004385;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496382) {
            if (f[8] <= -0.000064) {
              return 0.023144;
            } else {
              return -0.017078;
            }
          } else {
            if (f[8] <= 0.000036) {
              return -0.033663;
            } else {
              return -0.012227;
            }
          }
        } else {
          if (f[1] <= 0.003558) {
            if (f[61] <= 0.558775) {
              return -0.009487;
            } else {
              return 0.033944;
            }
          } else {
            if (f[22] <= -0.055362) {
              return 0.050371;
            } else {
              return 0.022356;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[49] <= 0.253054) {
          if (f[19] <= 2.828494) {
            if (f[49] <= -0.364256) {
              return 0.021259;
            } else {
              return 0.042294;
            }
          } else {
            return -0.003487;
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[29] <= 2.523432) {
              return 0.012326;
            } else {
              return 0.044755;
            }
          } else {
            if (f[44] <= 0.031022) {
              return 0.041233;
            } else {
              return -0.035200;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[3] <= 0.000200) {
            if (f[27] <= 0.324961) {
              return -0.062931;
            } else {
              return -0.014773;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.012911;
            } else {
              return 0.008500;
            }
          }
        } else {
          if (f[10] <= 0.000019) {
            if (f[60] <= 0.028862) {
              return 0.025147;
            } else {
              return 0.045317;
            }
          } else {
            if (f[53] <= -0.265780) {
              return -0.037303;
            } else {
              return 0.045822;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[19] <= 2.828494) {
            if (f[47] <= 0.348100) {
              return 0.040852;
            } else {
              return 0.021953;
            }
          } else {
            return -0.003907;
          }
        } else {
          if (f[46] <= -0.188842) {
            return -0.033907;
          } else {
            if (f[61] <= 0.462382) {
              return 0.036984;
            } else {
              return 0.004339;
            }
          }
        }
      } else {
        if (f[61] <= 0.538204) {
          if (f[41] <= -0.000025) {
            if (f[44] <= 0.031024) {
              return -0.011580;
            } else {
              return -0.078180;
            }
          } else {
            if (f[3] <= 0.000207) {
              return -0.042001;
            } else {
              return -0.006705;
            }
          }
        } else {
          if (f[50] <= 0.209189) {
            if (f[3] <= 0.000192) {
              return 0.003865;
            } else {
              return 0.035183;
            }
          } else {
            if (f[14] <= 0.000044) {
              return 0.001260;
            } else {
              return -0.060268;
            }
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[9] <= 0.000099) {
            if (f[61] <= 0.461333) {
              return 0.039860;
            } else {
              return 0.002590;
            }
          } else {
            return -0.063171;
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[32] <= 0.000000) {
              return 0.031236;
            } else {
              return -0.020208;
            }
          } else {
            if (f[13] <= 0.000138) {
              return 0.037377;
            } else {
              return 0.018758;
            }
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.495636) {
            if (f[41] <= 0.000005) {
              return 0.013617;
            } else {
              return -0.022750;
            }
          } else {
            if (f[10] <= -0.000082) {
              return -0.044073;
            } else {
              return -0.017888;
            }
          }
        } else {
          if (f[1] <= 0.003558) {
            if (f[61] <= 0.558775) {
              return -0.008747;
            } else {
              return 0.032789;
            }
          } else {
            if (f[22] <= -0.055362) {
              return 0.049876;
            } else {
              return 0.021712;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[19] <= -1.800279) {
        if (f[43] <= 0.513598) {
          if (f[7] <= -0.000193) {
            if (f[30] <= -1.168148) {
              return 0.036654;
            } else {
              return -0.014075;
            }
          } else {
            if (f[45] <= 0.604968) {
              return -0.008458;
            } else {
              return -0.047889;
            }
          }
        } else {
          if (f[38] <= 1.253697) {
            return 0.003475;
          } else {
            if (f[43] <= 0.671436) {
              return -0.069420;
            } else {
              return -0.026928;
            }
          }
        }
      } else {
        if (f[10] <= -0.000038) {
          if (f[23] <= 0.299719) {
            if (f[39] <= 0.007755) {
              return -0.062322;
            } else {
              return 0.015767;
            }
          } else {
            if (f[44] <= 0.031022) {
              return -0.062402;
            } else {
              return -0.010559;
            }
          }
        } else {
          if (f[14] <= 0.000132) {
            if (f[30] <= 1.019515) {
              return 0.005561;
            } else {
              return 0.023898;
            }
          } else {
            if (f[3] <= 0.000366) {
              return -0.032170;
            } else {
              return 0.003354;
            }
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[46] <= 0.123527) {
            if (f[10] <= -0.000176) {
              return 0.006378;
            } else {
              return 0.041540;
            }
          } else {
            if (f[45] <= 0.451625) {
              return -0.033801;
            } else {
              return 0.032941;
            }
          }
        } else {
          if (f[46] <= -0.188842) {
            return -0.032633;
          } else {
            if (f[61] <= 0.462382) {
              return 0.036134;
            } else {
              return 0.003780;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[3] <= 0.000200) {
            if (f[9] <= 0.000042) {
              return -0.009030;
            } else {
              return -0.055212;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.011434;
            } else {
              return 0.008323;
            }
          }
        } else {
          if (f[38] <= 1.563379) {
            if (f[21] <= 0.000066) {
              return 0.044759;
            } else {
              return -0.008109;
            }
          } else {
            return -0.009678;
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[20] <= 0.002583) {
          if (f[46] <= -0.186687) {
            return -0.064103;
          } else {
            if (f[61] <= 0.462382) {
              return 0.037064;
            } else {
              return 0.010113;
            }
          }
        } else {
          if (f[9] <= 0.000246) {
            if (f[19] <= 2.358512) {
              return 0.042520;
            } else {
              return 0.010910;
            }
          } else {
            return -0.003354;
          }
        }
      } else {
        if (f[61] <= 0.528374) {
          if (f[41] <= -0.000025) {
            return -0.058185;
          } else {
            if (f[56] <= 0.192756) {
              return -0.009362;
            } else {
              return -0.036266;
            }
          }
        } else {
          if (f[50] <= 0.209189) {
            if (f[20] <= 0.002582) {
              return 0.002181;
            } else {
              return 0.030045;
            }
          } else {
            if (f[9] <= 0.000114) {
              return -0.066378;
            } else {
              return -0.003132;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[49] <= 0.253054) {
          if (f[50] <= -0.049889) {
            if (f[42] <= 0.000067) {
              return -0.010898;
            } else {
              return 0.033930;
            }
          } else {
            if (f[13] <= -0.000173) {
              return 0.023094;
            } else {
              return 0.044570;
            }
          }
        } else {
          if (f[59] <= 0.569781) {
            if (f[32] <= 1.044017) {
              return 0.021253;
            } else {
              return -0.016271;
            }
          } else {
            return -0.039994;
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[3] <= 0.000200) {
            if (f[27] <= 0.324961) {
              return -0.055227;
            } else {
              return -0.011187;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.010536;
            } else {
              return 0.008028;
            }
          }
        } else {
          if (f[29] <= 4.701436) {
            if (f[21] <= 0.000066) {
              return 0.044540;
            } else {
              return -0.008389;
            }
          } else {
            return -0.009268;
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[44] <= 0.031022) {
            if (f[61] <= 0.461333) {
              return 0.038268;
            } else {
              return 0.003897;
            }
          } else {
            if (f[59] <= 0.428058) {
              return 0.018279;
            } else {
              return -0.081407;
            }
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[27] <= 2.736668) {
              return -0.013610;
            } else {
              return 0.046997;
            }
          } else {
            return 0.032580;
          }
        }
      } else {
        if (f[61] <= 0.528374) {
          if (f[8] <= -0.000420) {
            if (f[59] <= 0.188405) {
              return -0.018565;
            } else {
              return -0.078450;
            }
          } else {
            if (f[22] <= -0.796943) {
              return -0.033277;
            } else {
              return -0.007778;
            }
          }
        } else {
          if (f[56] <= 0.292709) {
            if (f[42] <= 0.000041) {
              return -0.012720;
            } else {
              return 0.025779;
            }
          } else {
            if (f[0] <= 45.532084) {
              return -0.042921;
            } else {
              return 0.031312;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[49] <= 0.253054) {
          if (f[59] <= -0.196802) {
            if (f[39] <= 0.659274) {
              return -0.020662;
            } else {
              return 0.039092;
            }
          } else {
            if (f[10] <= -0.000157) {
              return 0.008130;
            } else {
              return 0.042150;
            }
          }
        } else {
          if (f[57] <= 0.449246) {
            if (f[32] <= 1.044017) {
              return 0.026387;
            } else {
              return -0.027602;
            }
          } else {
            if (f[44] <= 0.031022) {
              return 0.039978;
            } else {
              return -0.036570;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[3] <= 0.000207) {
            if (f[21] <= 0.000031) {
              return -0.038832;
            } else {
              return 0.012856;
            }
          } else {
            if (f[61] <= 0.517574) {
              return -0.009657;
            } else {
              return 0.008444;
            }
          }
        } else {
          if (f[38] <= 1.563379) {
            if (f[21] <= 0.000066) {
              return 0.044331;
            } else {
              return -0.009065;
            }
          } else {
            return -0.009538;
          }
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[8] <= -0.000274) {
        if (f[3] <= 0.000649) {
          if (f[9] <= 0.000090) {
            if (f[15] <= -0.000239) {
              return 0.015675;
            } else {
              return -0.054533;
            }
          } else {
            if (f[7] <= -0.000193) {
              return 0.005063;
            } else {
              return 0.055528;
            }
          }
        } else {
          if (f[42] <= 0.000121) {
            if (f[59] <= 0.188405) {
              return -0.022132;
            } else {
              return -0.063553;
            }
          } else {
            if (f[15] <= 0.000100) {
              return 0.013269;
            } else {
              return -0.078063;
            }
          }
        }
      } else {
        if (f[3] <= 0.000637) {
          if (f[9] <= 0.000145) {
            if (f[29] <= 2.496440) {
              return -0.006461;
            } else {
              return 0.006551;
            }
          } else {
            return 0.042985;
          }
        } else {
          if (f[3] <= 0.000891) {
            if (f[51] <= 0.014187) {
              return 0.032307;
            } else {
              return 0.007232;
            }
          } else {
            if (f[31] <= 1.109051) {
              return 0.029862;
            } else {
              return -0.021305;
            }
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[8] <= -0.000274) {
        if (f[43] <= 0.496524) {
          if (f[10] <= -0.000208) {
            return -0.041124;
          } else {
            if (f[38] <= 0.058559) {
              return -0.027682;
            } else {
              return 0.030985;
            }
          }
        } else {
          if (f[3] <= 0.000649) {
            if (f[49] <= 0.300752) {
              return -0.015295;
            } else {
              return 0.044385;
            }
          } else {
            if (f[8] <= -0.000565) {
              return -0.001931;
            } else {
              return -0.064492;
            }
          }
        }
      } else {
        if (f[3] <= 0.000637) {
          if (f[9] <= 0.000145) {
            if (f[46] <= -0.177927) {
              return -0.026136;
            } else {
              return -0.000840;
            }
          } else {
            if (f[54] <= 0.080251) {
              return 0.050331;
            } else {
              return 0.028225;
            }
          }
        } else {
          if (f[3] <= 0.000891) {
            if (f[43] <= 0.010812) {
              return -0.050185;
            } else {
              return 0.028654;
            }
          } else {
            if (f[37] <= 0.369684) {
              return 0.029193;
            } else {
              return -0.020201;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[61] <= 0.484578) {
        if (f[42] <= 0.000057) {
          if (f[44] <= 0.031022) {
            if (f[41] <= 0.000004) {
              return 0.029604;
            } else {
              return -0.002919;
            }
          } else {
            if (f[60] <= 0.623116) {
              return 0.016265;
            } else {
              return -0.070524;
            }
          }
        } else {
          if (f[10] <= -0.000104) {
            if (f[23] <= 1.335681) {
              return 0.025007;
            } else {
              return -0.026872;
            }
          } else {
            if (f[13] <= 0.000138) {
              return 0.035566;
            } else {
              return 0.014871;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[56] <= 0.192756) {
            if (f[61] <= 0.521644) {
              return -0.010517;
            } else {
              return 0.010869;
            }
          } else {
            if (f[4] <= 0.000000) {
              return -0.063853;
            } else {
              return 0.016250;
            }
          }
        } else {
          if (f[55] <= 0.420917) {
            if (f[48] <= -0.697429) {
              return -0.007200;
            } else {
              return 0.028828;
            }
          } else {
            return -0.039507;
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[19] <= 2.828494) {
            if (f[13] <= -0.000025) {
              return 0.023831;
            } else {
              return 0.041550;
            }
          } else {
            return -0.011358;
          }
        } else {
          if (f[20] <= 0.002583) {
            if (f[24] <= 0.000000) {
              return -0.048422;
            } else {
              return 0.010563;
            }
          } else {
            if (f[10] <= 0.000063) {
              return 0.045982;
            } else {
              return 0.027229;
            }
          }
        }
      } else {
        if (f[61] <= 0.560259) {
          if (f[61] <= 0.493555) {
            if (f[55] <= 0.412174) {
              return 0.009348;
            } else {
              return -0.037074;
            }
          } else {
            if (f[61] <= 0.511394) {
              return -0.020172;
            } else {
              return -0.001315;
            }
          }
        } else {
          if (f[21] <= 0.000066) {
            if (f[14] <= -0.000220) {
              return 0.001554;
            } else {
              return 0.044179;
            }
          } else {
            return -0.009516;
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[46] <= 0.123527) {
            if (f[10] <= -0.000176) {
              return 0.002491;
            } else {
              return 0.039898;
            }
          } else {
            if (f[29] <= 2.856856) {
              return -0.012465;
            } else {
              return 0.044095;
            }
          }
        } else {
          if (f[20] <= 0.002583) {
            if (f[24] <= 0.000000) {
              return -0.045203;
            } else {
              return 0.010216;
            }
          } else {
            return 0.040041;
          }
        }
      } else {
        if (f[61] <= 0.560259) {
          if (f[56] <= 0.192756) {
            if (f[61] <= 0.521644) {
              return -0.008178;
            } else {
              return 0.011298;
            }
          } else {
            if (f[23] <= 2.076574) {
              return -0.007984;
            } else {
              return -0.069531;
            }
          }
        } else {
          if (f[24] <= 0.058333) {
            if (f[15] <= 0.000120) {
              return 0.044379;
            } else {
              return 0.023055;
            }
          } else {
            if (f[56] <= 0.080545) {
              return 0.043836;
            } else {
              return -0.033178;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[19] <= 2.828494) {
            if (f[13] <= -0.000025) {
              return 0.022742;
            } else {
              return 0.041112;
            }
          } else {
            return -0.012392;
          }
        } else {
          if (f[1] <= 0.003335) {
            if (f[22] <= 0.127550) {
              return 0.040981;
            } else {
              return 0.007919;
            }
          } else {
            if (f[43] <= 0.491248) {
              return -0.016953;
            } else {
              return 0.027431;
            }
          }
        }
      } else {
        if (f[61] <= 0.558775) {
          if (f[22] <= -0.806528) {
            if (f[59] <= 0.643440) {
              return -0.015506;
            } else {
              return -0.065621;
            }
          } else {
            if (f[3] <= 0.000207) {
              return -0.027541;
            } else {
              return -0.001448;
            }
          }
        } else {
          if (f[21] <= 0.000074) {
            if (f[29] <= 4.951295) {
              return 0.043975;
            } else {
              return -0.024995;
            }
          } else {
            return -0.020210;
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[8] <= -0.000274) {
        if (f[3] <= 0.000649) {
          if (f[9] <= 0.000090) {
            if (f[8] <= -0.000310) {
              return 0.019245;
            } else {
              return -0.047319;
            }
          } else {
            return 0.033428;
          }
        } else {
          if (f[42] <= 0.000121) {
            if (f[43] <= 0.496524) {
              return -0.004745;
            } else {
              return -0.052680;
            }
          } else {
            if (f[2] <= 0.534246) {
              return 0.011564;
            } else {
              return -0.096201;
            }
          }
        }
      } else {
        if (f[3] <= 0.000637) {
          if (f[29] <= 2.824384) {
            if (f[9] <= 0.000134) {
              return -0.006331;
            } else {
              return 0.039185;
            }
          } else {
            if (f[43] <= 0.693131) {
              return 0.003620;
            } else {
              return 0.028754;
            }
          }
        } else {
          if (f[3] <= 0.000891) {
            if (f[43] <= 0.034327) {
              return -0.030941;
            } else {
              return 0.028869;
            }
          } else {
            if (f[31] <= 1.109051) {
              return 0.028493;
            } else {
              return -0.020244;
            }
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[61] <= 0.485742) {
        if (f[20] <= 0.002583) {
          if (f[46] <= -0.186687) {
            return -0.054607;
          } else {
            if (f[61] <= 0.462382) {
              return 0.035289;
            } else {
              return 0.006744;
            }
          }
        } else {
          if (f[3] <= 0.001987) {
            if (f[58] <= 0.275080) {
              return 0.040539;
            } else {
              return 0.010605;
            }
          } else {
            return -0.027820;
          }
        }
      } else {
        if (f[61] <= 0.538204) {
          if (f[56] <= 0.192756) {
            if (f[3] <= 0.000197) {
              return -0.038513;
            } else {
              return -0.004829;
            }
          } else {
            if (f[4] <= 0.000000) {
              return -0.060823;
            } else {
              return 0.014709;
            }
          }
        } else {
          if (f[56] <= 0.292709) {
            if (f[51] <= 0.041248) {
              return 0.025904;
            } else {
              return -0.053065;
            }
          } else {
            if (f[22] <= -0.321000) {
              return -0.048376;
            } else {
              return 0.006468;
            }
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[46] <= 0.123527) {
            if (f[10] <= -0.000176) {
              return 0.000074;
            } else {
              return 0.039197;
            }
          } else {
            if (f[45] <= 0.451625) {
              return -0.042851;
            } else {
              return 0.028852;
            }
          }
        } else {
          if (f[1] <= 0.003335) {
            if (f[22] <= 0.127550) {
              return 0.040485;
            } else {
              return 0.006866;
            }
          } else {
            if (f[45] <= 0.532852) {
              return -0.021220;
            } else {
              return 0.018318;
            }
          }
        }
      } else {
        if (f[61] <= 0.548625) {
          if (f[22] <= -0.806528) {
            if (f[59] <= 0.656669) {
              return -0.018543;
            } else {
              return -0.077989;
            }
          } else {
            if (f[3] <= 0.000207) {
              return -0.030144;
            } else {
              return -0.001546;
            }
          }
        } else {
          if (f[21] <= 0.000079) {
            if (f[29] <= 3.186596) {
              return 0.037185;
            } else {
              return -0.002965;
            }
          } else {
            return -0.032776;
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[51] <= -0.125635) {
        if (f[23] <= 3.398306) {
          if (f[27] <= 1.639572) {
            if (f[9] <= 0.000086) {
              return 0.053817;
            } else {
              return 0.039100;
            }
          } else {
            if (f[24] <= 0.041667) {
              return -0.028581;
            } else {
              return 0.045000;
            }
          }
        } else {
          return -0.041405;
        }
      } else {
        if (f[46] <= -0.191764) {
          if (f[13] <= -0.000088) {
            return -0.002783;
          } else {
            return -0.069673;
          }
        } else {
          if (f[51] <= 0.074985) {
            if (f[12] <= -0.000195) {
              return -0.031719;
            } else {
              return -0.000120;
            }
          } else {
            if (f[32] <= -0.066559) {
              return 0.049951;
            } else {
              return 0.010046;
            }
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[61] <= 0.485742) {
        if (f[20] <= 0.002583) {
          if (f[1] <= 0.003075) {
            if (f[6] <= -0.000077) {
              return -0.035087;
            } else {
              return 0.030086;
            }
          } else {
            if (f[61] <= 0.461333) {
              return 0.029350;
            } else {
              return -0.009766;
            }
          }
        } else {
          if (f[3] <= 0.001987) {
            if (f[58] <= 0.275080) {
              return 0.039235;
            } else {
              return 0.009983;
            }
          } else {
            return -0.027852;
          }
        }
      } else {
        if (f[61] <= 0.521644) {
          if (f[61] <= 0.496382) {
            if (f[48] <= -0.438273) {
              return -0.030024;
            } else {
              return 0.010902;
            }
          } else {
            if (f[23] <= 1.494034) {
              return -0.007626;
            } else {
              return -0.027162;
            }
          }
        } else {
          if (f[1] <= 0.002720) {
            if (f[61] <= 0.560259) {
              return -0.005659;
            } else {
              return 0.030097;
            }
          } else {
            if (f[9] <= 0.000105) {
              return 0.050284;
            } else {
              return 0.022571;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[61] <= 0.481680) {
        if (f[42] <= 0.000076) {
          if (f[61] <= 0.462382) {
            if (f[15] <= 0.000428) {
              return 0.035466;
            } else {
              return -0.023980;
            }
          } else {
            if (f[41] <= 0.000004) {
              return 0.021653;
            } else {
              return -0.016564;
            }
          }
        } else {
          if (f[0] <= 23.447145) {
            return -0.031858;
          } else {
            if (f[46] <= -0.183385) {
              return 0.000634;
            } else {
              return 0.038037;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[41] <= -0.000025) {
            if (f[50] <= -0.009973) {
              return -0.067980;
            } else {
              return -0.021458;
            }
          } else {
            if (f[3] <= 0.000210) {
              return -0.028743;
            } else {
              return -0.003332;
            }
          }
        } else {
          if (f[55] <= 0.421294) {
            if (f[21] <= 0.000079) {
              return 0.023364;
            } else {
              return -0.027691;
            }
          } else {
            return -0.049020;
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[51] <= -0.125635) {
        if (f[23] <= 3.599881) {
          if (f[33] <= 0.734582) {
            if (f[42] <= 0.000077) {
              return 0.053508;
            } else {
              return 0.038436;
            }
          } else {
            if (f[24] <= 0.041667) {
              return -0.026941;
            } else {
              return 0.044422;
            }
          }
        } else {
          return -0.041941;
        }
      } else {
        if (f[46] <= -0.191764) {
          if (f[13] <= -0.000088) {
            return -0.002742;
          } else {
            return -0.065890;
          }
        } else {
          if (f[51] <= 0.074985) {
            if (f[42] <= 0.000037) {
              return -0.014406;
            } else {
              return 0.000556;
            }
          } else {
            if (f[32] <= -0.066559) {
              return 0.049636;
            } else {
              return 0.008992;
            }
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[59] <= -0.196802) {
            if (f[39] <= 0.659274) {
              return -0.028810;
            } else {
              return 0.036682;
            }
          } else {
            if (f[10] <= -0.000176) {
              return -0.003995;
            } else {
              return 0.038597;
            }
          }
        } else {
          if (f[20] <= 0.002583) {
            if (f[9] <= 0.000071) {
              return 0.016556;
            } else {
              return -0.016759;
            }
          } else {
            if (f[10] <= 0.000069) {
              return 0.044978;
            } else {
              return 0.022130;
            }
          }
        }
      } else {
        if (f[61] <= 0.560259) {
          if (f[22] <= -0.806528) {
            if (f[59] <= 0.643440) {
              return -0.012358;
            } else {
              return -0.056205;
            }
          } else {
            if (f[22] <= 0.042173) {
              return 0.003470;
            } else {
              return -0.010521;
            }
          }
        } else {
          if (f[21] <= 0.000078) {
            if (f[38] <= 1.592770) {
              return 0.043499;
            } else {
              return -0.009853;
            }
          } else {
            return -0.028459;
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[61] <= 0.485742) {
        if (f[20] <= 0.002583) {
          if (f[14] <= 0.000132) {
            if (f[44] <= 0.031023) {
              return 0.017958;
            } else {
              return -0.040229;
            }
          } else {
            if (f[23] <= -0.000000) {
              return 0.046338;
            } else {
              return -0.028183;
            }
          }
        } else {
          if (f[3] <= 0.001987) {
            if (f[58] <= 0.275080) {
              return 0.038557;
            } else {
              return 0.008368;
            }
          } else {
            return -0.028761;
          }
        }
      } else {
        if (f[61] <= 0.517574) {
          if (f[61] <= 0.496382) {
            if (f[48] <= -0.438273) {
              return -0.028012;
            } else {
              return 0.010850;
            }
          } else {
            if (f[47] <= -0.399078) {
              return 0.015226;
            } else {
              return -0.017979;
            }
          }
        } else {
          if (f[1] <= 0.003558) {
            if (f[61] <= 0.560259) {
              return -0.005507;
            } else {
              return 0.029088;
            }
          } else {
            if (f[37] <= -0.137321) {
              return -0.004691;
            } else {
              return 0.040228;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[61] <= 0.478727) {
        if (f[55] <= 0.391133) {
          if (f[19] <= 2.828494) {
            if (f[13] <= -0.000025) {
              return 0.018866;
            } else {
              return 0.040004;
            }
          } else {
            return -0.018131;
          }
        } else {
          if (f[43] <= 0.489140) {
            if (f[22] <= 0.479917) {
              return 0.008057;
            } else {
              return -0.056988;
            }
          } else {
            if (f[20] <= 0.002582) {
              return 0.047259;
            } else {
              return -0.007164;
            }
          }
        }
      } else {
        if (f[61] <= 0.543059) {
          if (f[54] <= 0.322488) {
            if (f[3] <= 0.000207) {
              return -0.027071;
            } else {
              return -0.002926;
            }
          } else {
            return -0.051301;
          }
        } else {
          if (f[55] <= 0.421294) {
            if (f[48] <= -0.697429) {
              return -0.007149;
            } else {
              return 0.026788;
            }
          } else {
            return -0.045843;
          }
        }
      }
    })(f)
  ];
  const metaSum = metaScores.reduce((a,b) => a+b, 0);
  const metaConf = 1 / (1 + Math.exp(-metaSum));
  
  if (metaConf < 0.60) return {action: "HOLD", confidence: 0, reason: `meta:${metaConf.toFixed(2)}`};
  
  const action = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return {action, confidence, reason: `ML:frxUSDJPY prob:${mlProb.toFixed(2)} meta:${metaConf.toFixed(2)}`};
}


// ── ML Signal Router ──
function getMLSignal(symbol: string, features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const HOLD = {action:"HOLD", confidence:0, reason:"No ML model"};
  if (symbol === "BOOM1000")  return predict_BOOMk(features);
  if (symbol === "CRASH1000") return predict_CRASHk(features);
  if (symbol === "frxUSDJPY") return predict_frxUSDJPY(features);
  return HOLD;
}
