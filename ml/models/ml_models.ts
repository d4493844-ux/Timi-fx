
// ── ML Model: BOOM1000 ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: 120, Meta trees: 50
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
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[8] <= -0.000554) {
            if (f[16] <= 0.521382) {
              return 1.205970;
            } else {
              return 1.054430;
            }
          } else {
            if (f[8] <= -0.000450) {
              return 1.005934;
            } else {
              return 1.136248;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 1.247611;
            } else {
              return 1.214997;
            }
          } else {
            if (f[8] <= 0.000980) {
              return 1.063794;
            } else {
              return 1.185529;
            }
          }
        }
      } else {
        if (f[0] <= 32.464361) {
          if (f[15] <= 0.000008) {
            return 1.119980;
          } else {
            return 1.251079;
          }
        } else {
          if (f[15] <= -0.000000) {
            return 0.814082;
          } else {
            return 0.931735;
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[8] <= -0.000554) {
            if (f[16] <= 0.521382) {
              return 0.057382;
            } else {
              return -0.080003;
            }
          } else {
            if (f[8] <= -0.000450) {
              return -0.119629;
            } else {
              return -0.008595;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 0.099312;
            } else {
              return 0.066304;
            }
          } else {
            if (f[17] <= 0.555685) {
              return -0.075461;
            } else {
              return 0.039393;
            }
          }
        }
      } else {
        if (f[0] <= 32.464361) {
          if (f[20] <= 0.904042) {
            return -0.024461;
          } else {
            return 0.103206;
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[0] <= 60.827739) {
              return -0.260568;
            } else {
              return -0.260568;
            }
          } else {
            return -0.176868;
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[8] <= -0.000554) {
            if (f[16] <= 0.521382) {
              return 0.054555;
            } else {
              return -0.070781;
            }
          } else {
            if (f[18] <= 0.018333) {
              return 0.073831;
            } else {
              return -0.050358;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 0.096927;
            } else {
              return 0.063380;
            }
          } else {
            if (f[17] <= 0.555685) {
              return -0.066832;
            } else {
              return 0.037036;
            }
          }
        }
      } else {
        if (f[0] <= 32.464361) {
          if (f[20] <= 0.904042) {
            return -0.022214;
          } else {
            return 0.100932;
          }
        } else {
          if (f[14] <= -0.000179) {
            return -0.154162;
          } else {
            if (f[17] <= 0.503020) {
              return -0.206140;
            } else {
              return -0.233601;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[4] <= -0.000320) {
            return -0.129770;
          } else {
            if (f[17] <= 0.486470) {
              return -0.052614;
            } else {
              return 0.025459;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[0] <= 78.041023) {
              return 0.084943;
            } else {
              return 0.033566;
            }
          } else {
            if (f[8] <= 0.000980) {
              return -0.061959;
            } else {
              return 0.036407;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.057964;
          } else {
            if (f[20] <= 0.573067) {
              return -0.168889;
            } else {
              return -0.201022;
            }
          }
        } else {
          return 0.074902;
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[8] <= -0.000554) {
            if (f[16] <= 0.524949) {
              return 0.052836;
            } else {
              return -0.094299;
            }
          } else {
            if (f[18] <= 0.018333) {
              return 0.070797;
            } else {
              return -0.044627;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 0.093008;
            } else {
              return 0.057396;
            }
          } else {
            if (f[17] <= 0.555685) {
              return -0.055446;
            } else {
              return 0.034216;
            }
          }
        }
      } else {
        if (f[0] <= 32.464361) {
          if (f[15] <= 0.000008) {
            return -0.017645;
          } else {
            return 0.097836;
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[14] <= -0.000177) {
              return -0.182504;
            } else {
              return -0.172676;
            }
          } else {
            return -0.110878;
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[5] <= -0.000564) {
            if (f[14] <= -0.000193) {
              return -0.090029;
            } else {
              return 0.020093;
            }
          } else {
            return -0.124917;
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[20] <= 0.179494) {
              return 0.097150;
            } else {
              return 0.059149;
            }
          } else {
            if (f[9] <= 0.496787) {
              return -0.056891;
            } else {
              return 0.028629;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.046910;
          } else {
            if (f[20] <= 0.573067) {
              return -0.136468;
            } else {
              return -0.165143;
            }
          }
        } else {
          return 0.071918;
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[2] <= 0.001437) {
            if (f[17] <= 0.504379) {
              return -0.032187;
            } else {
              return 0.052350;
            }
          } else {
            if (f[14] <= -0.000191) {
              return -0.167515;
            } else {
              return -0.011153;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 0.089863;
            } else {
              return 0.051365;
            }
          } else {
            if (f[8] <= 0.000980) {
              return -0.051378;
            } else {
              return 0.035285;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.042420;
          } else {
            if (f[2] <= 0.001584) {
              return -0.152609;
            } else {
              return -0.125827;
            }
          }
        } else {
          return 0.068971;
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[6] <= 0.000470) {
            if (f[20] <= 0.105699) {
              return 0.065336;
            } else {
              return -0.006489;
            }
          } else {
            if (f[5] <= -0.000601) {
              return 0.023609;
            } else {
              return -0.190034;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[20] <= 0.179494) {
              return 0.094561;
            } else {
              return 0.053633;
            }
          } else {
            if (f[9] <= 0.496787) {
              return -0.050824;
            } else {
              return 0.028403;
            }
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          return 0.056319;
        } else {
          if (f[15] <= 0.000005) {
            if (f[6] <= 0.000333) {
              return -0.148128;
            } else {
              return -0.114886;
            }
          } else {
            return -0.050072;
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[5] <= -0.000564) {
            if (f[14] <= -0.000193) {
              return -0.072571;
            } else {
              return 0.018019;
            }
          } else {
            return -0.106562;
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[6] <= 0.000361) {
              return 0.087161;
            } else {
              return 0.045591;
            }
          } else {
            if (f[8] <= 0.000980) {
              return -0.046041;
            } else {
              return 0.034573;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.035979;
          } else {
            if (f[20] <= 0.573067) {
              return -0.107351;
            } else {
              return -0.136067;
            }
          }
        } else {
          return 0.067040;
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[17] <= 0.539654) {
            if (f[3] <= 0.000059) {
              return 0.052810;
            } else {
              return -0.044436;
            }
          } else {
            if (f[16] <= 0.340522) {
              return -0.029009;
            } else {
              return 0.059386;
            }
          }
        } else {
          if (f[6] <= 0.000361) {
            if (f[15] <= -0.000006) {
              return 0.056507;
            } else {
              return 0.091842;
            }
          } else {
            if (f[6] <= 0.000442) {
              return -0.051059;
            } else {
              return 0.056825;
            }
          }
        }
      } else {
        if (f[0] <= 32.464361) {
          if (f[20] <= 0.708386) {
            return -0.051207;
          } else {
            return 0.096515;
          }
        } else {
          if (f[15] <= -0.000000) {
            if (f[16] <= 0.185307) {
              return -0.124861;
            } else {
              return -0.136387;
            }
          } else {
            return -0.068298;
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[14] <= -0.000193) {
          if (f[2] <= 0.001431) {
            return 0.107800;
          } else {
            return -0.155752;
          }
        } else {
          if (f[16] <= 0.530780) {
            if (f[5] <= -0.000461) {
              return 0.013740;
            } else {
              return 0.052925;
            }
          } else {
            return -0.077761;
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          return 0.052170;
        } else {
          if (f[15] <= 0.000005) {
            if (f[20] <= 0.569567) {
              return -0.093921;
            } else {
              return -0.127932;
            }
          } else {
            return -0.038540;
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[6] <= 0.000320) {
            if (f[17] <= 0.501032) {
              return -0.034706;
            } else {
              return 0.040696;
            }
          } else {
            if (f[9] <= 0.480657) {
              return -0.158378;
            } else {
              return 0.005170;
            }
          }
        } else {
          if (f[6] <= 0.000361) {
            if (f[20] <= 0.436020) {
              return 0.090378;
            } else {
              return 0.051068;
            }
          } else {
            if (f[6] <= 0.000442) {
              return -0.049055;
            } else {
              return 0.052373;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.027221;
          } else {
            if (f[20] <= 0.573067) {
              return -0.090015;
            } else {
              return -0.120323;
            }
          }
        } else {
          return 0.064757;
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[4] <= -0.000320) {
          return -0.070740;
        } else {
          if (f[16] <= 0.530780) {
            if (f[6] <= 0.000526) {
              return 0.031941;
            } else {
              return -0.018595;
            }
          } else {
            return -0.078308;
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.024864;
          } else {
            if (f[20] <= 0.573067) {
              return -0.085213;
            } else {
              return -0.115853;
            }
          }
        } else {
          return 0.061971;
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[5] <= -0.000461) {
          if (f[5] <= -0.000564) {
            if (f[9] <= 0.461807) {
              return -0.050747;
            } else {
              return 0.017752;
            }
          } else {
            return -0.095867;
          }
        } else {
          if (f[6] <= 0.000361) {
            if (f[20] <= 0.436020) {
              return 0.089321;
            } else {
              return 0.047841;
            }
          } else {
            if (f[6] <= 0.000442) {
              return -0.046628;
            } else {
              return 0.049842;
            }
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          return 0.049078;
        } else {
          if (f[15] <= 0.000001) {
            if (f[4] <= -0.000289) {
              return -0.125621;
            } else {
              return -0.079560;
            }
          } else {
            return -0.037054;
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[14] <= -0.000193) {
          if (f[2] <= 0.001431) {
            return 0.105668;
          } else {
            return -0.133563;
          }
        } else {
          if (f[8] <= -0.000655) {
            if (f[9] <= 0.509795) {
              return 0.100239;
            } else {
              return 0.069674;
            }
          } else {
            if (f[8] <= -0.000402) {
              return -0.023394;
            } else {
              return 0.033016;
            }
          }
        }
      } else {
        if (f[20] <= 0.803360) {
          if (f[0] <= 50.000822) {
            return -0.021441;
          } else {
            if (f[20] <= 0.573067) {
              return -0.076991;
            } else {
              return -0.109797;
            }
          }
        } else {
          return 0.060456;
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[0] <= 79.997706) {
          if (f[3] <= 0.000214) {
            if (f[18] <= 0.018333) {
              return 0.051487;
            } else {
              return -0.000330;
            }
          } else {
            return -0.143653;
          }
        } else {
          return 0.095940;
        }
      } else {
        if (f[0] <= 50.000822) {
          if (f[20] <= 0.679207) {
            return -0.075011;
          } else {
            return 0.100577;
          }
        } else {
          if (f[2] <= 0.001827) {
            if (f[8] <= 0.000082) {
              return -0.090025;
            } else {
              return -0.115335;
            }
          } else {
            return -0.048900;
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[16] <= 0.530780) {
          if (f[4] <= -0.000320) {
            return -0.061760;
          } else {
            if (f[6] <= 0.000516) {
              return 0.028045;
            } else {
              return -0.021913;
            }
          }
        } else {
          return -0.069707;
        }
      } else {
        if (f[0] <= 50.000822) {
          if (f[20] <= 0.679207) {
            return -0.068250;
          } else {
            return 0.098958;
          }
        } else {
          if (f[15] <= 0.000001) {
            if (f[5] <= 0.000656) {
              return -0.101151;
            } else {
              return -0.111067;
            }
          } else {
            return -0.048628;
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[3] <= 0.000265) {
          if (f[6] <= 0.000526) {
            if (f[8] <= -0.000402) {
              return -0.003487;
            } else {
              return 0.036484;
            }
          } else {
            if (f[5] <= -0.000598) {
              return 0.004843;
            } else {
              return -0.130406;
            }
          }
        } else {
          return 0.094907;
        }
      } else {
        if (f[0] <= 50.000822) {
          if (f[20] <= 0.679207) {
            return -0.062281;
          } else {
            return 0.097478;
          }
        } else {
          if (f[15] <= 0.000001) {
            if (f[1] <= 2.792677) {
              return -0.099006;
            } else {
              return -0.108852;
            }
          } else {
            return -0.045397;
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[3] <= 0.000265) {
          if (f[3] <= 0.000214) {
            if (f[5] <= -0.000461) {
              return -0.001214;
            } else {
              return 0.047939;
            }
          } else {
            return -0.118556;
          }
        } else {
          return 0.093595;
        }
      } else {
        if (f[0] <= 50.000822) {
          if (f[20] <= 0.679207) {
            return -0.056968;
          } else {
            return 0.096123;
          }
        } else {
          if (f[15] <= 0.000001) {
            if (f[1] <= 2.792677) {
              return -0.097222;
            } else {
              return -0.106297;
            }
          } else {
            return -0.042374;
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[14] <= -0.000193) {
          if (f[2] <= 0.001431) {
            return 0.104042;
          } else {
            return -0.121504;
          }
        } else {
          if (f[8] <= -0.000655) {
            if (f[9] <= 0.509795) {
              return 0.098484;
            } else {
              return 0.066649;
            }
          } else {
            if (f[8] <= -0.000402) {
              return -0.022566;
            } else {
              return 0.027202;
            }
          }
        }
      } else {
        if (f[3] <= 0.000061) {
          return 0.034400;
        } else {
          if (f[15] <= -0.000000) {
            if (f[16] <= 0.190479) {
              return -0.095547;
            } else {
              return -0.112896;
            }
          } else {
            return -0.022525;
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[20] <= 0.167764) {
        if (f[5] <= -0.000588) {
          if (f[5] <= -0.000595) {
            if (f[17] <= 0.539654) {
              return -0.025884;
            } else {
              return 0.081176;
            }
          } else {
            return -0.110707;
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[9] <= 0.533310) {
              return 0.094438;
            } else {
              return 0.020993;
            }
          } else {
            return -0.011967;
          }
        }
      } else {
        if (f[7] <= -0.977224) {
          if (f[17] <= 0.504379) {
            return -0.039053;
          } else {
            return 0.076178;
          }
        } else {
          if (f[19] <= 0.002583) {
            if (f[6] <= 0.000093) {
              return -0.028720;
            } else {
              return -0.142047;
            }
          } else {
            if (f[6] <= 0.000267) {
              return 0.045909;
            } else {
              return -0.031968;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[0] <= 79.997706) {
          if (f[6] <= 0.000526) {
            if (f[16] <= 0.565065) {
              return 0.018070;
            } else {
              return -0.086918;
            }
          } else {
            if (f[0] <= 56.516886) {
              return -0.135221;
            } else {
              return -0.018254;
            }
          }
        } else {
          return 0.092057;
        }
      } else {
        if (f[20] <= 0.764615) {
          if (f[6] <= 0.000346) {
            if (f[15] <= -0.000000) {
              return -0.064158;
            } else {
              return -0.131575;
            }
          } else {
            return -0.009835;
          }
        } else {
          return 0.048431;
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[20] <= 0.167764) {
        if (f[9] <= 0.480657) {
          if (f[17] <= 0.562539) {
            if (f[2] <= 0.001474) {
              return 0.009596;
            } else {
              return -0.133184;
            }
          } else {
            return 0.093620;
          }
        } else {
          if (f[9] <= 0.491045) {
            if (f[5] <= -0.000589) {
              return 0.101725;
            } else {
              return 0.094715;
            }
          } else {
            if (f[18] <= 0.018333) {
              return 0.092819;
            } else {
              return 0.004189;
            }
          }
        }
      } else {
        if (f[6] <= 0.000573) {
          if (f[3] <= 0.000214) {
            if (f[20] <= 0.501048) {
              return 0.003405;
            } else {
              return -0.043074;
            }
          } else {
            return -0.186045;
          }
        } else {
          return 0.079638;
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[20] <= 0.167764) {
        if (f[5] <= -0.000588) {
          if (f[5] <= -0.000595) {
            if (f[9] <= 0.465744) {
              return -0.086639;
            } else {
              return 0.046405;
            }
          } else {
            return -0.097030;
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[9] <= 0.533310) {
              return 0.092711;
            } else {
              return 0.015115;
            }
          } else {
            return -0.012084;
          }
        }
      } else {
        if (f[6] <= 0.000573) {
          if (f[3] <= 0.000214) {
            if (f[15] <= 0.000001) {
              return -0.018049;
            } else {
              return 0.026683;
            }
          } else {
            return -0.165109;
          }
        } else {
          return 0.077038;
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[0] <= 79.997706) {
        if (f[2] <= 0.001435) {
          if (f[5] <= -0.000609) {
            if (f[2] <= 0.001360) {
              return 0.109174;
            } else {
              return 0.073376;
            }
          } else {
            if (f[19] <= 0.002585) {
              return -0.021991;
            } else {
              return 0.063160;
            }
          }
        } else {
          if (f[14] <= -0.000192) {
            return -0.110224;
          } else {
            if (f[5] <= -0.000599) {
              return 0.038489;
            } else {
              return -0.020621;
            }
          }
        }
      } else {
        return 0.089942;
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[20] <= 0.501048) {
        if (f[9] <= 0.457461) {
          if (f[20] <= 0.248423) {
            return 0.020613;
          } else {
            return 0.101192;
          }
        } else {
          if (f[9] <= 0.461807) {
            return -0.140905;
          } else {
            if (f[4] <= -0.000320) {
              return -0.075109;
            } else {
              return 0.016024;
            }
          }
        }
      } else {
        if (f[0] <= 50.000822) {
          if (f[20] <= 0.679207) {
            return -0.042169;
          } else {
            return 0.095052;
          }
        } else {
          if (f[2] <= 0.001876) {
            if (f[8] <= 0.000088) {
              return -0.073431;
            } else {
              return -0.101205;
            }
          } else {
            return -0.016324;
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[0] <= 79.997706) {
        if (f[8] <= -0.000554) {
          if (f[8] <= -0.000636) {
            if (f[19] <= 0.002583) {
              return -0.046066;
            } else {
              return 0.044063;
            }
          } else {
            if (f[14] <= -0.000175) {
              return 0.062022;
            } else {
              return 0.104214;
            }
          }
        } else {
          if (f[8] <= -0.000446) {
            if (f[17] <= 0.490032) {
              return -0.171060;
            } else {
              return -0.000479;
            }
          } else {
            if (f[1] <= -0.162632) {
              return 0.047422;
            } else {
              return -0.015600;
            }
          }
        }
      } else {
        return 0.089060;
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[20] <= 0.175675) {
        if (f[5] <= -0.000588) {
          if (f[2] <= 0.001474) {
            if (f[4] <= -0.000300) {
              return 0.077689;
            } else {
              return -0.036769;
            }
          } else {
            if (f[8] <= 0.000026) {
              return -0.111827;
            } else {
              return 0.020220;
            }
          }
        } else {
          if (f[4] <= 0.001461) {
            if (f[17] <= 0.619145) {
              return 0.084563;
            } else {
              return 0.009312;
            }
          } else {
            return 0.001052;
          }
        }
      } else {
        if (f[5] <= -0.000604) {
          if (f[14] <= -0.000183) {
            return -0.012891;
          } else {
            return 0.108910;
          }
        } else {
          if (f[9] <= 0.533310) {
            if (f[7] <= -0.977224) {
              return 0.033290;
            } else {
              return -0.036098;
            }
          } else {
            if (f[20] <= 0.441622) {
              return 0.094475;
            } else {
              return 0.017928;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[6] <= 0.000687) {
        if (f[6] <= 0.000516) {
          if (f[20] <= 0.501048) {
            if (f[6] <= 0.000442) {
              return 0.003833;
            } else {
              return 0.070260;
            }
          } else {
            if (f[0] <= 50.000822) {
              return 0.009805;
            } else {
              return -0.074310;
            }
          }
        } else {
          if (f[1] <= 2.676041) {
            return -0.177894;
          } else {
            if (f[18] <= 0.018333) {
              return 0.030205;
            } else {
              return -0.051254;
            }
          }
        }
      } else {
        return 0.081732;
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[5] <= -0.000605) {
        if (f[14] <= -0.000193) {
          return -0.041719;
        } else {
          if (f[9] <= 0.466730) {
            return -0.008762;
          } else {
            if (f[6] <= 0.000077) {
              return 0.010273;
            } else {
              return 0.083837;
            }
          }
        }
      } else {
        if (f[5] <= -0.000587) {
          if (f[8] <= -0.000653) {
            return 0.044489;
          } else {
            if (f[14] <= -0.000176) {
              return -0.019678;
            } else {
              return -0.091079;
            }
          }
        } else {
          if (f[5] <= -0.000579) {
            if (f[9] <= 0.508676) {
              return 0.095747;
            } else {
              return 0.063478;
            }
          } else {
            if (f[20] <= 0.179494) {
              return 0.042038;
            } else {
              return -0.018233;
            }
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[1] <= 8.787768) {
        if (f[5] <= 0.001857) {
          if (f[17] <= 0.565302) {
            if (f[14] <= -0.000176) {
              return 0.007705;
            } else {
              return -0.031011;
            }
          } else {
            if (f[2] <= 0.001397) {
              return 0.071664;
            } else {
              return 0.003283;
            }
          }
        } else {
          return -0.081493;
        }
      } else {
        return 0.081987;
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[6] <= 0.000687) {
        if (f[6] <= 0.000530) {
          if (f[20] <= 0.501048) {
            if (f[14] <= -0.000167) {
              return 0.000765;
            } else {
              return 0.050491;
            }
          } else {
            if (f[20] <= 0.679207) {
              return -0.068808;
            } else {
              return 0.019516;
            }
          }
        } else {
          if (f[8] <= 0.000389) {
            return -0.116679;
          } else {
            if (f[4] <= 0.001814) {
              return 0.073105;
            } else {
              return -0.056706;
            }
          }
        }
      } else {
        return 0.077193;
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[16] <= 0.565065) {
        if (f[18] <= 0.115000) {
          if (f[1] <= -4.679488) {
            return -0.105598;
          } else {
            if (f[6] <= 0.000093) {
              return 0.087744;
            } else {
              return -0.002403;
            }
          }
        } else {
          return 0.085122;
        }
      } else {
        return -0.073563;
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[5] <= -0.000605) {
        if (f[14] <= -0.000188) {
          if (f[2] <= 0.001431) {
            return 0.088150;
          } else {
            return -0.075802;
          }
        } else {
          if (f[9] <= 0.496921) {
            if (f[5] <= -0.000612) {
              return 0.072501;
            } else {
              return -0.009322;
            }
          } else {
            return 0.098050;
          }
        }
      } else {
        if (f[9] <= 0.529715) {
          if (f[5] <= -0.000604) {
            return -0.104558;
          } else {
            if (f[20] <= 0.174908) {
              return 0.023609;
            } else {
              return -0.020574;
            }
          }
        } else {
          if (f[9] <= 0.546651) {
            if (f[9] <= 0.541373) {
              return 0.098306;
            } else {
              return 0.064626;
            }
          } else {
            return -0.026594;
          }
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[1] <= 8.266207) {
        if (f[3] <= 0.000059) {
          if (f[16] <= 0.372621) {
            return -0.038199;
          } else {
            if (f[16] <= 0.469499) {
              return 0.097842;
            } else {
              return 0.036104;
            }
          }
        } else {
          if (f[5] <= -0.000605) {
            if (f[14] <= -0.000188) {
              return -0.021804;
            } else {
              return 0.051804;
            }
          } else {
            if (f[1] <= -4.788132) {
              return -0.093443;
            } else {
              return -0.009693;
            }
          }
        }
      } else {
        return 0.071337;
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[17] <= 0.554421) {
        if (f[17] <= 0.548387) {
          if (f[1] <= -4.679488) {
            return -0.082263;
          } else {
            if (f[6] <= 0.000093) {
              return 0.100158;
            } else {
              return -0.005243;
            }
          }
        } else {
          return -0.103339;
        }
      } else {
        if (f[16] <= 0.340522) {
          if (f[16] <= 0.293093) {
            if (f[14] <= -0.000176) {
              return -0.048321;
            } else {
              return 0.043545;
            }
          } else {
            return -0.102446;
          }
        } else {
          if (f[20] <= 0.295977) {
            if (f[16] <= 0.511193) {
              return 0.086758;
            } else {
              return 0.012016;
            }
          } else {
            if (f[17] <= 0.610286) {
              return 0.057496;
            } else {
              return -0.043572;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[6] <= 0.000687) {
        if (f[6] <= 0.000526) {
          if (f[20] <= 0.501048) {
            if (f[6] <= 0.000442) {
              return 0.002335;
            } else {
              return 0.062327;
            }
          } else {
            if (f[0] <= 50.000822) {
              return 0.013240;
            } else {
              return -0.069565;
            }
          }
        } else {
          if (f[0] <= 56.516886) {
            return -0.120858;
          } else {
            if (f[17] <= 0.502942) {
              return -0.051014;
            } else {
              return 0.059638;
            }
          }
        }
      } else {
        return 0.072713;
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[1] <= 8.266207) {
        if (f[5] <= 0.001857) {
          if (f[15] <= 0.000001) {
            if (f[20] <= 0.501048) {
              return 0.000399;
            } else {
              return -0.056791;
            }
          } else {
            if (f[4] <= 0.000000) {
              return 0.116792;
            } else {
              return 0.004535;
            }
          }
        } else {
          return -0.072607;
        }
      } else {
        return 0.068095;
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[17] <= 0.554421) {
        if (f[8] <= -0.000402) {
          if (f[8] <= -0.000554) {
            if (f[1] <= -4.679488) {
              return -0.070640;
            } else {
              return 0.049821;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.015650;
            } else {
              return -0.143266;
            }
          }
        } else {
          if (f[1] <= 0.000000) {
            return 0.071178;
          } else {
            if (f[9] <= 0.486487) {
              return -0.050090;
            } else {
              return 0.024184;
            }
          }
        }
      } else {
        if (f[16] <= 0.340522) {
          if (f[2] <= 0.002073) {
            if (f[0] <= 59.682372) {
              return 0.058337;
            } else {
              return -0.035624;
            }
          } else {
            if (f[4] <= -0.000293) {
              return -0.012900;
            } else {
              return -0.135577;
            }
          }
        } else {
          if (f[20] <= 0.295977) {
            if (f[16] <= 0.516435) {
              return 0.084978;
            } else {
              return 0.003699;
            }
          } else {
            if (f[19] <= 0.002584) {
              return -0.040427;
            } else {
              return 0.061532;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[14] <= -0.000191) {
        if (f[2] <= 0.001435) {
          return 0.043323;
        } else {
          if (f[4] <= -0.000313) {
            return -0.099132;
          } else {
            return -0.038217;
          }
        }
      } else {
        if (f[8] <= -0.000656) {
          if (f[20] <= 0.219584) {
            return 0.060347;
          } else {
            return 0.100050;
          }
        } else {
          if (f[5] <= -0.000614) {
            return 0.093600;
          } else {
            if (f[1] <= -1.600448) {
              return -0.028139;
            } else {
              return 0.010294;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[3] <= 0.000059) {
        if (f[16] <= 0.373568) {
          return -0.027171;
        } else {
          if (f[16] <= 0.469499) {
            return 0.095642;
          } else {
            return 0.030825;
          }
        }
      } else {
        if (f[3] <= 0.000059) {
          return -0.065461;
        } else {
          if (f[2] <= 0.001435) {
            if (f[14] <= -0.000171) {
              return 0.041708;
            } else {
              return -0.030846;
            }
          } else {
            if (f[8] <= 0.000239) {
              return -0.035766;
            } else {
              return 0.017316;
            }
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[20] <= 0.803360) {
        if (f[20] <= 0.501048) {
          if (f[20] <= 0.454945) {
            if (f[16] <= 0.283556) {
              return 0.023317;
            } else {
              return -0.010826;
            }
          } else {
            return 0.072762;
          }
        } else {
          if (f[6] <= 0.000346) {
            if (f[15] <= -0.000000) {
              return -0.049408;
            } else {
              return -0.113710;
            }
          } else {
            return 0.012654;
          }
        }
      } else {
        return 0.065625;
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[14] <= -0.000192) {
        if (f[2] <= 0.001435) {
          return 0.051705;
        } else {
          return -0.081730;
        }
      } else {
        if (f[8] <= -0.000655) {
          if (f[14] <= -0.000183) {
            return 0.013736;
          } else {
            return 0.099003;
          }
        } else {
          if (f[19] <= 0.002585) {
            if (f[15] <= -0.000004) {
              return -0.115953;
            } else {
              return -0.005691;
            }
          } else {
            if (f[2] <= 0.001435) {
              return 0.062170;
            } else {
              return -0.001613;
            }
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[6] <= 0.000687) {
        if (f[6] <= 0.000516) {
          if (f[6] <= 0.000445) {
            if (f[2] <= 0.002073) {
              return 0.003907;
            } else {
              return -0.059706;
            }
          } else {
            if (f[6] <= 0.000468) {
              return 0.084428;
            } else {
              return 0.015839;
            }
          }
        } else {
          if (f[1] <= 2.676041) {
            return -0.132334;
          } else {
            if (f[18] <= 0.018333) {
              return 0.024295;
            } else {
              return -0.043226;
            }
          }
        }
      } else {
        return 0.067464;
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[17] <= 0.565302) {
        if (f[8] <= -0.000402) {
          if (f[8] <= -0.000554) {
            if (f[8] <= -0.000636) {
              return -0.021501;
            } else {
              return 0.079335;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.019921;
            } else {
              return -0.110696;
            }
          }
        } else {
          if (f[1] <= 0.000000) {
            if (f[19] <= 0.002585) {
              return 0.014817;
            } else {
              return 0.085308;
            }
          } else {
            if (f[9] <= 0.524324) {
              return -0.020819;
            } else {
              return 0.076841;
            }
          }
        }
      } else {
        if (f[16] <= 0.342525) {
          if (f[16] <= 0.293093) {
            if (f[1] <= 0.658058) {
              return -0.046803;
            } else {
              return 0.044884;
            }
          } else {
            return -0.084056;
          }
        } else {
          if (f[20] <= 0.261221) {
            if (f[16] <= 0.507200) {
              return 0.090120;
            } else {
              return 0.033315;
            }
          } else {
            if (f[17] <= 0.616186) {
              return 0.062183;
            } else {
              return -0.040878;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[3] <= 0.000059) {
        if (f[16] <= 0.372621) {
          return -0.025566;
        } else {
          if (f[16] <= 0.471661) {
            return 0.094138;
          } else {
            return 0.024257;
          }
        }
      } else {
        if (f[3] <= 0.000060) {
          if (f[16] <= 0.405068) {
            return 0.037315;
          } else {
            if (f[5] <= -0.000596) {
              return -0.147294;
            } else {
              return -0.026602;
            }
          }
        } else {
          if (f[20] <= 0.528337) {
            if (f[2] <= 0.001439) {
              return 0.035571;
            } else {
              return -0.005563;
            }
          } else {
            if (f[15] <= 0.000001) {
              return -0.078802;
            } else {
              return 0.005454;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[20] <= 0.803360) {
        if (f[20] <= 0.501048) {
          if (f[16] <= 0.168347) {
            if (f[10] <= 0.502686) {
              return 0.090210;
            } else {
              return -0.032463;
            }
          } else {
            if (f[9] <= 0.457461) {
              return 0.049466;
            } else {
              return -0.005499;
            }
          }
        } else {
          if (f[7] <= -0.976528) {
            return 0.029177;
          } else {
            if (f[6] <= 0.000346) {
              return -0.095851;
            } else {
              return -0.015435;
            }
          }
        }
      } else {
        return 0.064439;
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[1] <= 8.266207) {
        if (f[5] <= 0.001867) {
          if (f[15] <= 0.000001) {
            if (f[8] <= 0.000239) {
              return -0.010333;
            } else {
              return 0.043958;
            }
          } else {
            if (f[4] <= 0.000000) {
              return 0.116841;
            } else {
              return 0.003232;
            }
          }
        } else {
          return -0.077515;
        }
      } else {
        return 0.063680;
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[14] <= -0.000189) {
        if (f[2] <= 0.001427) {
          return 0.044143;
        } else {
          if (f[1] <= 2.396854) {
            return -0.078328;
          } else {
            return -0.001166;
          }
        }
      } else {
        if (f[8] <= -0.000655) {
          if (f[20] <= 0.248423) {
            return 0.057108;
          } else {
            return 0.099611;
          }
        } else {
          if (f[5] <= -0.000612) {
            return 0.072907;
          } else {
            if (f[5] <= -0.000587) {
              return -0.030004;
            } else {
              return 0.009477;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[8] <= 0.001007) {
        if (f[4] <= 0.001461) {
          if (f[15] <= 0.000006) {
            if (f[14] <= -0.000173) {
              return 0.006593;
            } else {
              return -0.026023;
            }
          } else {
            if (f[15] <= 0.000016) {
              return 0.092835;
            } else {
              return 0.010208;
            }
          }
        } else {
          return -0.058860;
        }
      } else {
        if (f[15] <= 0.000037) {
          return 0.101840;
        } else {
          return -0.013789;
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
// Main model trees: 120, Meta trees: 50
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
      if (f[20] <= 0.496759) {
        if (f[5] <= 0.000587) {
          if (f[16] <= 0.343921) {
            if (f[3] <= 0.000094) {
              return 0.743535;
            } else {
              return 0.890186;
            }
          } else {
            if (f[17] <= 0.515300) {
              return 1.016516;
            } else {
              return 0.930146;
            }
          }
        } else {
          if (f[18] <= 0.145000) {
            if (f[18] <= 0.055000) {
              return 0.960805;
            } else {
              return 1.007004;
            }
          } else {
            return 0.812244;
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[4] <= 0.000280) {
            return 0.821529;
          } else {
            return 1.016516;
          }
        } else {
          if (f[17] <= 0.544899) {
            return 0.775104;
          } else {
            if (f[14] <= 0.000186) {
              return 0.634667;
            } else {
              return 0.686538;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[20] <= 0.461060) {
        if (f[5] <= 0.000587) {
          if (f[16] <= 0.343921) {
            if (f[3] <= 0.000094) {
              return -0.138378;
            } else {
              return -0.003753;
            }
          } else {
            if (f[17] <= 0.515300) {
              return 0.108948;
            } else {
              return 0.027828;
            }
          }
        } else {
          if (f[18] <= 0.145000) {
            if (f[18] <= 0.055000) {
              return 0.056101;
            } else {
              return 0.102126;
            }
          } else {
            return -0.091151;
          }
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.083765;
        } else {
          if (f[17] <= 0.517941) {
            return -0.047916;
          } else {
            if (f[20] <= 0.496759) {
              return -0.067602;
            } else {
              return -0.193922;
            }
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[20] <= 0.461060) {
        if (f[5] <= 0.000587) {
          if (f[0] <= 18.662042) {
            if (f[17] <= 0.605814) {
              return 0.089690;
            } else {
              return 0.110694;
            }
          } else {
            if (f[17] <= 0.448095) {
              return 0.109659;
            } else {
              return -0.009076;
            }
          }
        } else {
          if (f[19] <= 0.002582) {
            return -0.063575;
          } else {
            if (f[18] <= 0.055000) {
              return 0.053013;
            } else {
              return 0.106663;
            }
          }
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.080196;
        } else {
          if (f[17] <= 0.517941) {
            return -0.043245;
          } else {
            if (f[4] <= 0.000305) {
              return -0.187493;
            } else {
              return -0.104522;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[20] <= 0.461060) {
        if (f[5] <= 0.000587) {
          if (f[16] <= 0.343921) {
            if (f[3] <= 0.000094) {
              return -0.120416;
            } else {
              return -0.004051;
            }
          } else {
            if (f[17] <= 0.515300) {
              return 0.104781;
            } else {
              return 0.025189;
            }
          }
        } else {
          if (f[18] <= 0.148333) {
            if (f[18] <= 0.055000) {
              return 0.050081;
            } else {
              return 0.096580;
            }
          } else {
            return -0.086494;
          }
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.076852;
        } else {
          if (f[15] <= -0.000000) {
            return -0.063302;
          } else {
            if (f[20] <= 0.521118) {
              return -0.080230;
            } else {
              return -0.161504;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[5] <= 0.000587) {
          if (f[0] <= 18.662042) {
            if (f[14] <= -0.001015) {
              return 0.084704;
            } else {
              return 0.107051;
            }
          } else {
            if (f[17] <= 0.448095) {
              return 0.106178;
            } else {
              return -0.014124;
            }
          }
        } else {
          if (f[18] <= 0.151667) {
            if (f[18] <= 0.055000) {
              return 0.045040;
            } else {
              return 0.093136;
            }
          } else {
            return -0.100296;
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[4] <= 0.000280) {
            return -0.062236;
          } else {
            return 0.107502;
          }
        } else {
          if (f[0] <= 33.980923) {
            return -0.070259;
          } else {
            if (f[3] <= 0.000061) {
              return -0.106496;
            } else {
              return -0.174605;
            }
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[20] <= 0.459593) {
        if (f[5] <= 0.000596) {
          if (f[16] <= 0.343921) {
            if (f[6] <= 0.000497) {
              return -0.000189;
            } else {
              return -0.108156;
            }
          } else {
            if (f[17] <= 0.515300) {
              return 0.101383;
            } else {
              return 0.022373;
            }
          }
        } else {
          if (f[19] <= 0.002582) {
            return -0.046107;
          } else {
            if (f[0] <= 100.000000) {
              return 0.092619;
            } else {
              return 0.018117;
            }
          }
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.073693;
        } else {
          if (f[17] <= 0.517941) {
            return -0.021922;
          } else {
            if (f[3] <= 0.000061) {
              return -0.035385;
            } else {
              return -0.129472;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[5] <= 0.000593) {
          if (f[16] <= 0.343921) {
            if (f[19] <= 0.002588) {
              return -0.092197;
            } else {
              return -0.004137;
            }
          } else {
            if (f[17] <= 0.515300) {
              return 0.099312;
            } else {
              return 0.019752;
            }
          }
        } else {
          if (f[18] <= 0.148333) {
            if (f[18] <= 0.055000) {
              return 0.042384;
            } else {
              return 0.087405;
            }
          } else {
            return -0.040868;
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[4] <= 0.000280) {
            return -0.053730;
          } else {
            return 0.104761;
          }
        } else {
          if (f[0] <= 33.980923) {
            return -0.054998;
          } else {
            if (f[3] <= 0.000061) {
              return -0.091898;
            } else {
              return -0.149893;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[20] <= 0.459593) {
        if (f[6] <= 0.000595) {
          if (f[6] <= 0.000433) {
            if (f[6] <= 0.000007) {
              return -0.065468;
            } else {
              return 0.036721;
            }
          } else {
            if (f[16] <= 0.373522) {
              return -0.101412;
            } else {
              return 0.060538;
            }
          }
        } else {
          return 0.108558;
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.069518;
        } else {
          if (f[9] <= 0.487934) {
            if (f[5] <= 0.000595) {
              return -0.143585;
            } else {
              return -0.076758;
            }
          } else {
            if (f[1] <= -1.108953) {
              return 0.028415;
            } else {
              return -0.096274;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[20] <= 0.459593) {
        if (f[6] <= 0.000595) {
          if (f[6] <= 0.000433) {
            if (f[20] <= 0.254482) {
              return 0.049811;
            } else {
              return 0.007830;
            }
          } else {
            if (f[16] <= 0.373522) {
              return -0.089628;
            } else {
              return 0.057599;
            }
          }
        } else {
          return 0.105718;
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.066711;
        } else {
          if (f[17] <= 0.517941) {
            return -0.010051;
          } else {
            if (f[4] <= 0.000305) {
              return -0.121156;
            } else {
              return -0.053073;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[9] <= 0.473244) {
          if (f[14] <= 0.000174) {
            return 0.036459;
          } else {
            if (f[19] <= 0.002583) {
              return 0.111932;
            } else {
              return 0.085700;
            }
          }
        } else {
          if (f[20] <= 0.339504) {
            if (f[4] <= 0.000304) {
              return 0.012533;
            } else {
              return 0.071085;
            }
          } else {
            if (f[5] <= -0.000494) {
              return -0.084292;
            } else {
              return -0.002049;
            }
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[4] <= 0.000280) {
            return -0.044487;
          } else {
            return 0.102583;
          }
        } else {
          if (f[0] <= 33.980923) {
            return -0.037328;
          } else {
            if (f[7] <= -0.976273) {
              return -0.073606;
            } else {
              return -0.128744;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[9] <= 0.473244) {
          if (f[14] <= 0.000174) {
            return 0.034141;
          } else {
            if (f[6] <= 0.000165) {
              return 0.106065;
            } else {
              return 0.078131;
            }
          }
        } else {
          if (f[17] <= 0.498773) {
            if (f[15] <= 0.000007) {
              return 0.091774;
            } else {
              return -0.000377;
            }
          } else {
            if (f[17] <= 0.584517) {
              return -0.028465;
            } else {
              return 0.023409;
            }
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[4] <= 0.000280) {
            return -0.040573;
          } else {
            return 0.100530;
          }
        } else {
          if (f[17] <= 0.544899) {
            return -0.034852;
          } else {
            if (f[5] <= -0.000469) {
              return -0.079056;
            } else {
              return -0.117445;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[20] <= 0.375192) {
        if (f[4] <= 0.000301) {
          if (f[3] <= 0.000221) {
            if (f[0] <= 27.568112) {
              return -0.168780;
            } else {
              return 0.012463;
            }
          } else {
            if (f[2] <= 0.004386) {
              return 0.089928;
            } else {
              return 0.008057;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[3] <= 0.000060) {
              return 0.014398;
            } else {
              return 0.093045;
            }
          } else {
            if (f[15] <= 0.000000) {
              return 0.047722;
            } else {
              return -0.041409;
            }
          }
        }
      } else {
        if (f[15] <= -0.000000) {
          if (f[0] <= 29.301040) {
            return -0.094732;
          } else {
            if (f[15] <= -0.000007) {
              return 0.092182;
            } else {
              return -0.008053;
            }
          }
        } else {
          if (f[9] <= 0.522477) {
            if (f[2] <= 0.001437) {
              return -0.044875;
            } else {
              return -0.112275;
            }
          } else {
            return 0.002444;
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[5] <= 0.000593) {
          if (f[17] <= 0.448095) {
            return 0.099596;
          } else {
            if (f[16] <= 0.343921) {
              return -0.035075;
            } else {
              return 0.020745;
            }
          }
        } else {
          if (f[18] <= 0.151667) {
            if (f[18] <= 0.055000) {
              return 0.033354;
            } else {
              return 0.082164;
            }
          } else {
            return -0.076970;
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[20] <= 0.773793) {
            return -0.047495;
          } else {
            return 0.087394;
          }
        } else {
          if (f[0] <= 33.980923) {
            return -0.022618;
          } else {
            if (f[7] <= -0.976273) {
              return -0.058362;
            } else {
              return -0.114982;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[20] <= 0.375192) {
        if (f[6] <= 0.000007) {
          return -0.077144;
        } else {
          if (f[4] <= 0.000304) {
            if (f[15] <= 0.000010) {
              return 0.024160;
            } else {
              return -0.039209;
            }
          } else {
            if (f[0] <= 100.000000) {
              return 0.101078;
            } else {
              return 0.014259;
            }
          }
        }
      } else {
        if (f[16] <= 0.096485) {
          return 0.069400;
        } else {
          if (f[7] <= -0.976366) {
            if (f[15] <= -0.000000) {
              return 0.064447;
            } else {
              return -0.017560;
            }
          } else {
            if (f[9] <= 0.525970) {
              return -0.073307;
            } else {
              return 0.025267;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[20] <= 0.375192) {
        if (f[6] <= 0.000592) {
          if (f[6] <= 0.000435) {
            if (f[19] <= 0.002582) {
              return -0.054075;
            } else {
              return 0.034518;
            }
          } else {
            if (f[3] <= 0.000288) {
              return -0.059168;
            } else {
              return 0.080455;
            }
          }
        } else {
          return 0.101272;
        }
      } else {
        if (f[15] <= -0.000000) {
          if (f[8] <= -0.000758) {
            return -0.082842;
          } else {
            if (f[17] <= 0.689559) {
              return 0.054601;
            } else {
              return -0.039174;
            }
          }
        } else {
          if (f[9] <= 0.522477) {
            if (f[2] <= 0.001437) {
              return -0.034723;
            } else {
              return -0.098255;
            }
          } else {
            return 0.002312;
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[20] <= 0.459593) {
        if (f[6] <= 0.000595) {
          if (f[6] <= 0.000445) {
            if (f[20] <= 0.254482) {
              return 0.040732;
            } else {
              return -0.002875;
            }
          } else {
            if (f[16] <= 0.374106) {
              return -0.081194;
            } else {
              return 0.055875;
            }
          }
        } else {
          return 0.099199;
        }
      } else {
        if (f[15] <= -0.000010) {
          return 0.061795;
        } else {
          if (f[12] <= 9.716299) {
            return -0.111084;
          } else {
            if (f[1] <= -1.108953) {
              return 0.010838;
            } else {
              return -0.061580;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[9] <= 0.473244) {
          if (f[14] <= 0.000174) {
            return 0.030008;
          } else {
            if (f[6] <= 0.000165) {
              return 0.102769;
            } else {
              return 0.074707;
            }
          }
        } else {
          if (f[17] <= 0.498773) {
            if (f[15] <= 0.000007) {
              return 0.087195;
            } else {
              return -0.008312;
            }
          } else {
            if (f[6] <= 0.000595) {
              return -0.008226;
            } else {
              return 0.098045;
            }
          }
        }
      } else {
        if (f[9] <= 0.481462) {
          if (f[16] <= 0.530381) {
            if (f[6] <= 0.000428) {
              return -0.117237;
            } else {
              return -0.072249;
            }
          } else {
            return -0.036942;
          }
        } else {
          if (f[1] <= -0.776520) {
            return 0.077326;
          } else {
            if (f[1] <= 0.457132) {
              return -0.095989;
            } else {
              return 0.002226;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[20] <= 0.375192) {
        if (f[2] <= 0.001035) {
          return -0.065119;
        } else {
          if (f[19] <= 0.002582) {
            return -0.053293;
          } else {
            if (f[16] <= 0.482242) {
              return 0.016747;
            } else {
              return 0.083888;
            }
          }
        }
      } else {
        if (f[17] <= 0.515300) {
          if (f[14] <= 0.000176) {
            return 0.084690;
          } else {
            return -0.024074;
          }
        } else {
          if (f[5] <= -0.001270) {
            return -0.118214;
          } else {
            if (f[15] <= -0.000007) {
              return 0.071047;
            } else {
              return -0.041184;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[9] <= 0.473244) {
          if (f[14] <= 0.000174) {
            return 0.027639;
          } else {
            if (f[6] <= 0.000165) {
              return 0.100775;
            } else {
              return 0.071731;
            }
          }
        } else {
          if (f[6] <= 0.000008) {
            return -0.109589;
          } else {
            if (f[5] <= 0.000587) {
              return -0.009753;
            } else {
              return 0.043255;
            }
          }
        }
      } else {
        if (f[9] <= 0.481462) {
          if (f[16] <= 0.530381) {
            if (f[6] <= 0.000428) {
              return -0.111901;
            } else {
              return -0.067321;
            }
          } else {
            return -0.032370;
          }
        } else {
          if (f[1] <= -0.776520) {
            return 0.074947;
          } else {
            if (f[15] <= -0.000001) {
              return 0.012641;
            } else {
              return -0.081735;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[20] <= 0.254482) {
        if (f[17] <= 0.501687) {
          if (f[16] <= 0.376562) {
            return 0.100375;
          } else {
            return 0.089911;
          }
        } else {
          if (f[3] <= 0.000224) {
            if (f[1] <= -2.057534) {
              return -0.129375;
            } else {
              return 0.018261;
            }
          } else {
            if (f[2] <= 0.004386) {
              return 0.107967;
            } else {
              return 0.018402;
            }
          }
        }
      } else {
        if (f[15] <= -0.000000) {
          if (f[5] <= -0.001484) {
            return -0.071909;
          } else {
            if (f[2] <= 0.001573) {
              return 0.015075;
            } else {
              return 0.089069;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[5] <= 0.000591) {
              return -0.048897;
            } else {
              return 0.028973;
            }
          } else {
            return -0.135943;
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[20] <= 0.496759) {
        if (f[9] <= 0.473244) {
          if (f[14] <= 0.000174) {
            return 0.024962;
          } else {
            if (f[6] <= 0.000165) {
              return 0.098565;
            } else {
              return 0.069321;
            }
          }
        } else {
          if (f[17] <= 0.438445) {
            return 0.095327;
          } else {
            if (f[20] <= 0.254482) {
              return 0.018353;
            } else {
              return -0.023651;
            }
          }
        }
      } else {
        if (f[9] <= 0.481462) {
          if (f[16] <= 0.530381) {
            if (f[6] <= 0.000428) {
              return -0.108311;
            } else {
              return -0.062013;
            }
          } else {
            return -0.029125;
          }
        } else {
          if (f[20] <= 0.647475) {
            return -0.048736;
          } else {
            return 0.058438;
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.498773) {
          if (f[1] <= -0.831988) {
            if (f[2] <= 0.002640) {
              return 0.097922;
            } else {
              return 0.055074;
            }
          } else {
            if (f[4] <= 0.000294) {
              return -0.075426;
            } else {
              return 0.063315;
            }
          }
        } else {
          if (f[6] <= 0.000445) {
            if (f[20] <= 0.289248) {
              return 0.024445;
            } else {
              return -0.020481;
            }
          } else {
            if (f[1] <= -4.609604) {
              return 0.043655;
            } else {
              return -0.070047;
            }
          }
        }
      } else {
        return 0.095979;
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.498773) {
          if (f[8] <= -0.000030) {
            if (f[2] <= 0.002640) {
              return 0.096456;
            } else {
              return 0.052037;
            }
          } else {
            if (f[4] <= 0.000296) {
              return -0.071564;
            } else {
              return 0.060883;
            }
          }
        } else {
          if (f[6] <= 0.000435) {
            if (f[17] <= 0.525170) {
              return -0.059569;
            } else {
              return 0.008018;
            }
          } else {
            if (f[3] <= 0.000224) {
              return -0.074740;
            } else {
              return 0.004988;
            }
          }
        }
      } else {
        return 0.094595;
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[20] <= 0.504458) {
        if (f[9] <= 0.473244) {
          if (f[20] <= 0.384046) {
            if (f[14] <= 0.000174) {
              return -0.000864;
            } else {
              return 0.080602;
            }
          } else {
            return 0.111500;
          }
        } else {
          if (f[0] <= 18.662042) {
            return 0.080191;
          } else {
            if (f[0] <= 20.428634) {
              return -0.127644;
            } else {
              return 0.003409;
            }
          }
        }
      } else {
        if (f[9] <= 0.481462) {
          if (f[16] <= 0.530381) {
            if (f[6] <= 0.000428) {
              return -0.104854;
            } else {
              return -0.072951;
            }
          } else {
            return -0.026133;
          }
        } else {
          if (f[1] <= -0.776520) {
            return 0.080308;
          } else {
            if (f[19] <= 0.002585) {
              return 0.016619;
            } else {
              return -0.083144;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.510222) {
          if (f[1] <= -0.831988) {
            if (f[14] <= 0.000178) {
              return 0.100590;
            } else {
              return 0.011534;
            }
          } else {
            if (f[18] <= 0.041667) {
              return -0.096471;
            } else {
              return 0.043938;
            }
          }
        } else {
          if (f[6] <= 0.000435) {
            if (f[17] <= 0.525170) {
              return -0.070400;
            } else {
              return 0.007595;
            }
          } else {
            if (f[16] <= 0.373522) {
              return -0.074662;
            } else {
              return 0.013406;
            }
          }
        }
      } else {
        return 0.093284;
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[20] <= 0.504458) {
        if (f[9] <= 0.473244) {
          if (f[20] <= 0.384046) {
            if (f[14] <= 0.000174) {
              return -0.002885;
            } else {
              return 0.078794;
            }
          } else {
            return 0.108576;
          }
        } else {
          if (f[17] <= 0.438445) {
            return 0.091589;
          } else {
            if (f[20] <= 0.254482) {
              return 0.016101;
            } else {
              return -0.021410;
            }
          }
        }
      } else {
        if (f[15] <= -0.000002) {
          if (f[20] <= 0.773793) {
            return -0.023064;
          } else {
            return 0.083913;
          }
        } else {
          if (f[0] <= 34.119238) {
            return 0.008313;
          } else {
            if (f[7] <= -0.976273) {
              return -0.031661;
            } else {
              return -0.102318;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.518612) {
          if (f[1] <= -0.831988) {
            if (f[18] <= 0.011667) {
              return 0.034148;
            } else {
              return 0.106891;
            }
          } else {
            if (f[16] <= 0.342241) {
              return -0.102371;
            } else {
              return 0.039217;
            }
          }
        } else {
          if (f[17] <= 0.524921) {
            return -0.142692;
          } else {
            if (f[6] <= 0.000435) {
              return 0.007044;
            } else {
              return -0.047688;
            }
          }
        }
      } else {
        return 0.092245;
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[20] <= 0.375192) {
        if (f[6] <= 0.000007) {
          return -0.077601;
        } else {
          if (f[4] <= 0.000304) {
            if (f[2] <= 0.001035) {
              return -0.097124;
            } else {
              return 0.011840;
            }
          } else {
            if (f[0] <= 100.000000) {
              return 0.096095;
            } else {
              return -0.004471;
            }
          }
        }
      } else {
        if (f[16] <= 0.096485) {
          return 0.068890;
        } else {
          if (f[17] <= 0.515300) {
            return 0.029124;
          } else {
            if (f[16] <= 0.203922) {
              return -0.103705;
            } else {
              return -0.024922;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.751570) {
          if (f[17] <= 0.700652) {
            if (f[6] <= 0.000532) {
              return 0.000685;
            } else {
              return -0.059840;
            }
          } else {
            if (f[20] <= 0.481177) {
              return 0.080666;
            } else {
              return -0.033630;
            }
          }
        } else {
          return -0.073823;
        }
      } else {
        return 0.091007;
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[4] <= -0.001884) {
        return 0.096846;
      } else {
        if (f[11] <= -2.821200) {
          if (f[4] <= -0.001627) {
            return -0.097759;
          } else {
            if (f[20] <= 0.060661) {
              return 0.078405;
            } else {
              return -0.000291;
            }
          }
        } else {
          return -0.090602;
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[4] <= -0.001884) {
        return 0.095368;
      } else {
        if (f[11] <= -2.821200) {
          if (f[7] <= -0.976366) {
            if (f[10] <= 0.510270) {
              return 0.037906;
            } else {
              return -0.074064;
            }
          } else {
            if (f[7] <= -0.961372) {
              return -0.040374;
            } else {
              return 0.006535;
            }
          }
        } else {
          return -0.083410;
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[20] <= 0.504458) {
        if (f[9] <= 0.473244) {
          if (f[2] <= 0.001363) {
            return 0.107651;
          } else {
            if (f[9] <= 0.462096) {
              return -0.012761;
            } else {
              return 0.092061;
            }
          }
        } else {
          if (f[17] <= 0.438445) {
            return 0.089795;
          } else {
            if (f[5] <= 0.000593) {
              return -0.013149;
            } else {
              return 0.025687;
            }
          }
        }
      } else {
        if (f[9] <= 0.468610) {
          if (f[20] <= 0.699474) {
            return -0.077766;
          } else {
            return -0.099742;
          }
        } else {
          if (f[20] <= 0.762232) {
            if (f[5] <= -0.000669) {
              return 0.029282;
            } else {
              return -0.055251;
            }
          } else {
            return 0.077091;
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[6] <= 0.000007) {
        return -0.071381;
      } else {
        if (f[5] <= 0.000587) {
          if (f[0] <= 45.610969) {
            if (f[20] <= 0.339504) {
              return 0.025967;
            } else {
              return -0.022102;
            }
          } else {
            if (f[17] <= 0.560022) {
              return -0.096870;
            } else {
              return -0.010665;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[17] <= 0.649852) {
              return 0.062025;
            } else {
              return -0.003453;
            }
          } else {
            if (f[18] <= 0.065000) {
              return -0.129185;
            } else {
              return 0.028492;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[4] <= 0.000324) {
        if (f[0] <= 100.000000) {
          if (f[8] <= 0.000658) {
            if (f[6] <= 0.000099) {
              return -0.042431;
            } else {
              return 0.004460;
            }
          } else {
            if (f[3] <= 0.000060) {
              return 0.054849;
            } else {
              return 0.108751;
            }
          }
        } else {
          if (f[15] <= -0.000000) {
            return 0.041625;
          } else {
            return -0.135969;
          }
        }
      } else {
        return 0.077507;
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[19] <= 0.002630) {
        if (f[6] <= 0.000435) {
          if (f[8] <= -0.000477) {
            if (f[5] <= -0.001041) {
              return -0.005005;
            } else {
              return 0.093702;
            }
          } else {
            if (f[0] <= 30.974396) {
              return -0.120313;
            } else {
              return 0.001226;
            }
          }
        } else {
          if (f[15] <= 0.000013) {
            if (f[17] <= 0.510222) {
              return 0.045205;
            } else {
              return -0.074128;
            }
          } else {
            if (f[19] <= 0.002601) {
              return 0.089838;
            } else {
              return -0.071691;
            }
          }
        }
      } else {
        return 0.064565;
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[6] <= 0.000595) {
        if (f[17] <= 0.751570) {
          if (f[17] <= 0.700652) {
            if (f[6] <= 0.000532) {
              return 0.000448;
            } else {
              return -0.056675;
            }
          } else {
            if (f[20] <= 0.481177) {
              return 0.077296;
            } else {
              return -0.026029;
            }
          }
        } else {
          return -0.065005;
        }
      } else {
        return 0.089356;
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[3] <= 0.000312) {
        if (f[5] <= -0.001273) {
          if (f[3] <= 0.000206) {
            return -0.096442;
          } else {
            if (f[20] <= 0.294455) {
              return 0.055364;
            } else {
              return -0.044386;
            }
          }
        } else {
          if (f[14] <= -0.000937) {
            return 0.087906;
          } else {
            if (f[12] <= 9.708744) {
              return -0.042374;
            } else {
              return 0.005010;
            }
          }
        }
      } else {
        return 0.070198;
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[19] <= 0.002582) {
        return -0.045809;
      } else {
        if (f[5] <= 0.000587) {
          if (f[3] <= 0.000094) {
            if (f[15] <= 0.000000) {
              return -0.013368;
            } else {
              return -0.103759;
            }
          } else {
            if (f[2] <= 0.001228) {
              return 0.068604;
            } else {
              return -0.004930;
            }
          }
        } else {
          if (f[12] <= 9.708744) {
            return -0.100811;
          } else {
            if (f[20] <= 0.262426) {
              return 0.071413;
            } else {
              return 0.011385;
            }
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[17] <= 0.498773) {
        if (f[5] <= -0.000013) {
          if (f[17] <= 0.457346) {
            return 0.063656;
          } else {
            return 0.097568;
          }
        } else {
          if (f[4] <= 0.000293) {
            return -0.076422;
          } else {
            if (f[18] <= 0.048333) {
              return 0.027881;
            } else {
              return 0.096343;
            }
          }
        }
      } else {
        if (f[4] <= -0.001884) {
          return 0.094382;
        } else {
          if (f[4] <= -0.001757) {
            return -0.119339;
          } else {
            if (f[20] <= 0.071270) {
              return 0.058662;
            } else {
              return -0.006846;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[20] <= 0.840145) {
        if (f[20] <= 0.504458) {
          if (f[9] <= 0.473244) {
            if (f[2] <= 0.001363) {
              return 0.105413;
            } else {
              return 0.031838;
            }
          } else {
            if (f[9] <= 0.475409) {
              return -0.079289;
            } else {
              return 0.003675;
            }
          }
        } else {
          if (f[9] <= 0.500894) {
            if (f[8] <= 0.000655) {
              return -0.079879;
            } else {
              return -0.014508;
            }
          } else {
            return 0.020228;
          }
        }
      } else {
        return 0.071530;
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[6] <= 0.000007) {
        return -0.061100;
      } else {
        if (f[4] <= 0.000305) {
          if (f[4] <= 0.000303) {
            if (f[5] <= 0.000587) {
              return -0.009915;
            } else {
              return 0.030883;
            }
          } else {
            return -0.078858;
          }
        } else {
          if (f[0] <= 100.000000) {
            if (f[20] <= 0.403859) {
              return 0.093776;
            } else {
              return 0.019136;
            }
          } else {
            if (f[18] <= 0.065000) {
              return -0.136197;
            } else {
              return 0.050689;
            }
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[4] <= -0.001884) {
        return 0.092168;
      } else {
        if (f[6] <= 0.000435) {
          if (f[8] <= -0.000477) {
            if (f[9] <= 0.477457) {
              return -0.058918;
            } else {
              return 0.071030;
            }
          } else {
            if (f[0] <= 30.974396) {
              return -0.101534;
            } else {
              return 0.000518;
            }
          }
        } else {
          if (f[4] <= 0.000299) {
            if (f[17] <= 0.510222) {
              return 0.035298;
            } else {
              return -0.054648;
            }
          } else {
            return 0.044429;
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[19] <= 0.002582) {
        return -0.042765;
      } else {
        if (f[5] <= 0.000587) {
          if (f[0] <= 45.610969) {
            if (f[7] <= -0.944464) {
              return 0.065115;
            } else {
              return -0.002571;
            }
          } else {
            if (f[20] <= 0.183978) {
              return -0.118357;
            } else {
              return -0.023881;
            }
          }
        } else {
          if (f[12] <= 9.708744) {
            return -0.088094;
          } else {
            if (f[20] <= 0.262426) {
              return 0.068554;
            } else {
              return 0.010438;
            }
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[3] <= 0.000312) {
        if (f[5] <= -0.001474) {
          if (f[4] <= -0.001011) {
            return -0.107080;
          } else {
            return 0.009131;
          }
        } else {
          if (f[14] <= -0.000937) {
            return 0.086582;
          } else {
            if (f[1] <= -3.582524) {
              return -0.079554;
            } else {
              return 0.000947;
            }
          }
        }
      } else {
        return 0.066685;
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[20] <= 0.840145) {
        if (f[20] <= 0.521118) {
          if (f[9] <= 0.473244) {
            if (f[2] <= 0.001363) {
              return 0.103406;
            } else {
              return 0.026443;
            }
          } else {
            if (f[18] <= 0.165000) {
              return 0.002689;
            } else {
              return -0.079820;
            }
          }
        } else {
          if (f[19] <= 0.002602) {
            if (f[15] <= 0.000000) {
              return -0.016973;
            } else {
              return -0.089836;
            }
          } else {
            return 0.038708;
          }
        }
      } else {
        return 0.068631;
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[19] <= 0.002630) {
        if (f[6] <= 0.000435) {
          if (f[8] <= -0.000477) {
            if (f[16] <= 0.444348) {
              return 0.071388;
            } else {
              return -0.056482;
            }
          } else {
            if (f[0] <= 30.974396) {
              return -0.091718;
            } else {
              return 0.000423;
            }
          }
        } else {
          if (f[5] <= -0.000637) {
            if (f[15] <= -0.000010) {
              return 0.025561;
            } else {
              return -0.081750;
            }
          } else {
            if (f[15] <= 0.000013) {
              return -0.048592;
            } else {
              return 0.075970;
            }
          }
        }
      } else {
        return 0.060962;
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[17] <= 0.498773) {
        if (f[8] <= -0.000030) {
          if (f[16] <= 0.279147) {
            return 0.036649;
          } else {
            return 0.093480;
          }
        } else {
          if (f[4] <= 0.000293) {
            return -0.085106;
          } else {
            return 0.058722;
          }
        }
      } else {
        if (f[17] <= 0.584517) {
          if (f[4] <= -0.000821) {
            if (f[20] <= 0.102179) {
              return -0.026649;
            } else {
              return 0.083529;
            }
          } else {
            if (f[15] <= -0.000001) {
              return -0.113520;
            } else {
              return -0.014600;
            }
          }
        } else {
          if (f[17] <= 0.597460) {
            return 0.074741;
          } else {
            if (f[20] <= 0.104778) {
              return 0.071028;
            } else {
              return -0.008743;
            }
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[17] <= 0.747756) {
        if (f[17] <= 0.701627) {
          if (f[10] <= 0.509565) {
            if (f[10] <= 0.502433) {
              return -0.003057;
            } else {
              return 0.090148;
            }
          } else {
            if (f[9] <= 0.549580) {
              return -0.095495;
            } else {
              return 0.004914;
            }
          }
        } else {
          if (f[20] <= 0.481177) {
            if (f[7] <= -0.934890) {
              return 0.098305;
            } else {
              return 0.017044;
            }
          } else {
            return -0.013808;
          }
        }
      } else {
        if (f[20] <= 0.299431) {
          return 0.011372;
        } else {
          return -0.101833;
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[20] <= 0.840145) {
        if (f[20] <= 0.521118) {
          if (f[2] <= 0.000784) {
            return 0.117866;
          } else {
            if (f[2] <= 0.000957) {
              return -0.069954;
            } else {
              return 0.005142;
            }
          }
        } else {
          if (f[19] <= 0.002602) {
            if (f[15] <= 0.000000) {
              return -0.015505;
            } else {
              return -0.088002;
            }
          } else {
            return 0.039717;
          }
        }
      } else {
        return 0.067954;
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[4] <= -0.001884) {
        return 0.090227;
      } else {
        if (f[4] <= -0.001757) {
          return -0.101693;
        } else {
          if (f[20] <= 0.060661) {
            return 0.071709;
          } else {
            if (f[17] <= 0.758982) {
              return 0.000509;
            } else {
              return -0.062146;
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
      if (f[40] <= 0.497992) {
        if (f[40] <= 0.481663) {
          if (f[3] <= 0.001685) {
            if (f[31] <= 1.002184) {
              return 0.852268;
            } else {
              return 0.824014;
            }
          } else {
            return 0.771719;
          }
        } else {
          if (f[30] <= 0.040100) {
            if (f[33] <= -0.210526) {
              return 0.828797;
            } else {
              return 0.786743;
            }
          } else {
            if (f[7] <= 0.000044) {
              return 0.839348;
            } else {
              return 0.810932;
            }
          }
        }
      } else {
        if (f[40] <= 0.519555) {
          if (f[3] <= 0.000587) {
            if (f[40] <= 0.507101) {
              return 0.767230;
            } else {
              return 0.796618;
            }
          } else {
            if (f[22] <= 0.364709) {
              return 0.745093;
            } else {
              return 0.795511;
            }
          }
        } else {
          if (f[35] <= 0.901431) {
            if (f[10] <= -0.000031) {
              return 0.806653;
            } else {
              return 0.848632;
            }
          } else {
            if (f[29] <= 0.126519) {
              return 0.777580;
            } else {
              return 0.847340;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[8] <= -0.000152) {
        if (f[22] <= -0.909048) {
          if (f[10] <= -0.000164) {
            return -0.035079;
          } else {
            if (f[24] <= 0.158333) {
              return 0.035206;
            } else {
              return -0.019361;
            }
          }
        } else {
          if (f[36] <= 0.696868) {
            if (f[39] <= 0.133801) {
              return -0.027072;
            } else {
              return -0.071075;
            }
          } else {
            if (f[23] <= 0.268082) {
              return 0.050124;
            } else {
              return -0.004287;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[9] <= 0.000038) {
            if (f[36] <= 0.583812) {
              return -0.055578;
            } else {
              return 0.001561;
            }
          } else {
            if (f[21] <= -0.000183) {
              return -0.027597;
            } else {
              return 0.029851;
            }
          }
        } else {
          if (f[0] <= 35.725995) {
            if (f[36] <= 0.650393) {
              return -0.062906;
            } else {
              return 0.018627;
            }
          } else {
            if (f[25] <= 0.500000) {
              return 0.013401;
            } else {
              return -0.002703;
            }
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[40] <= 0.497992) {
        if (f[40] <= 0.481663) {
          if (f[3] <= 0.001685) {
            if (f[31] <= 1.002184) {
              return 0.043468;
            } else {
              return 0.015775;
            }
          } else {
            return -0.033571;
          }
        } else {
          if (f[30] <= 0.040100) {
            if (f[6] <= -0.000033) {
              return 0.016450;
            } else {
              return -0.021132;
            }
          } else {
            if (f[6] <= 0.000113) {
              return 0.025121;
            } else {
              return -0.025684;
            }
          }
        }
      } else {
        if (f[40] <= 0.519555) {
          if (f[23] <= 2.217167) {
            if (f[31] <= 0.749972) {
              return 0.015108;
            } else {
              return -0.030123;
            }
          } else {
            if (f[23] <= 4.174766) {
              return -0.072304;
            } else {
              return -0.034330;
            }
          }
        } else {
          if (f[35] <= 0.901431) {
            if (f[13] <= -0.000132) {
              return -0.022425;
            } else {
              return 0.035992;
            }
          } else {
            if (f[37] <= 0.007958) {
              return 0.001538;
            } else {
              return -0.051469;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[8] <= -0.000152) {
        if (f[22] <= -0.909048) {
          if (f[30] <= 0.018124) {
            if (f[8] <= -0.000391) {
              return 0.057189;
            } else {
              return 0.037790;
            }
          } else {
            if (f[39] <= 0.299827) {
              return -0.007827;
            } else {
              return 0.057174;
            }
          }
        } else {
          if (f[36] <= 0.696868) {
            if (f[32] <= 0.000041) {
              return 0.039070;
            } else {
              return -0.036136;
            }
          } else {
            if (f[23] <= 0.268082) {
              return 0.049390;
            } else {
              return -0.003415;
            }
          }
        }
      } else {
        if (f[23] <= -0.583832) {
          return -0.064598;
        } else {
          if (f[33] <= -0.210526) {
            if (f[9] <= 0.000038) {
              return -0.028381;
            } else {
              return 0.027321;
            }
          } else {
            if (f[37] <= 0.153481) {
              return 0.004378;
            } else {
              return -0.016528;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[40] <= 0.495356) {
        if (f[40] <= 0.481663) {
          if (f[3] <= 0.001685) {
            if (f[31] <= 1.002184) {
              return 0.042405;
            } else {
              return 0.015144;
            }
          } else {
            return -0.031561;
          }
        } else {
          if (f[14] <= 0.000088) {
            if (f[31] <= 1.031126) {
              return 0.022458;
            } else {
              return -0.023114;
            }
          } else {
            if (f[29] <= 0.037918) {
              return -0.032437;
            } else {
              return 0.010620;
            }
          }
        }
      } else {
        if (f[40] <= 0.521059) {
          if (f[29] <= 0.029258) {
            if (f[24] <= 0.191667) {
              return -0.043840;
            } else {
              return 0.004432;
            }
          } else {
            if (f[40] <= 0.499940) {
              return 0.021221;
            } else {
              return -0.025595;
            }
          }
        } else {
          if (f[35] <= 0.960211) {
            if (f[3] <= 0.001010) {
              return 0.036297;
            } else {
              return -0.018135;
            }
          } else {
            if (f[29] <= 0.126519) {
              return -0.032755;
            } else {
              return 0.041321;
            }
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[40] <= 0.495356) {
        if (f[40] <= 0.481663) {
          if (f[1] <= -0.052339) {
            return -0.049770;
          } else {
            if (f[25] <= 0.500000) {
              return 0.050875;
            } else {
              return 0.024359;
            }
          }
        } else {
          if (f[14] <= 0.000088) {
            if (f[31] <= 1.031126) {
              return 0.021758;
            } else {
              return -0.021990;
            }
          } else {
            if (f[29] <= 0.037918) {
              return -0.030768;
            } else {
              return 0.010239;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[23] <= -0.583832) {
            return -0.091316;
          } else {
            if (f[38] <= 1.000000) {
              return -0.018370;
            } else {
              return -0.059387;
            }
          }
        } else {
          if (f[23] <= 0.978421) {
            if (f[37] <= 0.018902) {
              return 0.016261;
            } else {
              return -0.077832;
            }
          } else {
            if (f[23] <= 7.311949) {
              return 0.052796;
            } else {
              return -0.000018;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[40] <= 0.497992) {
        if (f[40] <= 0.482832) {
          if (f[1] <= -0.052339) {
            return -0.046949;
          } else {
            if (f[31] <= 1.017909) {
              return 0.037723;
            } else {
              return 0.010777;
            }
          }
        } else {
          if (f[33] <= -0.210526) {
            if (f[1] <= -0.013132) {
              return -0.001780;
            } else {
              return 0.039986;
            }
          } else {
            if (f[29] <= 0.038754) {
              return -0.017379;
            } else {
              return 0.014656;
            }
          }
        }
      } else {
        if (f[40] <= 0.519555) {
          if (f[23] <= 2.217167) {
            if (f[21] <= -0.000188) {
              return -0.051699;
            } else {
              return -0.017085;
            }
          } else {
            if (f[0] <= 29.527005) {
              return -0.017796;
            } else {
              return -0.060395;
            }
          }
        } else {
          if (f[35] <= 0.901431) {
            if (f[10] <= -0.000031) {
              return -0.001605;
            } else {
              return 0.037949;
            }
          } else {
            if (f[32] <= 0.000034) {
              return -0.083978;
            } else {
              return -0.007602;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[3] <= 0.001685) {
          if (f[31] <= 1.017909) {
            if (f[6] <= 0.000170) {
              return 0.040761;
            } else {
              return -0.009679;
            }
          } else {
            if (f[23] <= 0.772803) {
              return -0.026242;
            } else {
              return 0.035708;
            }
          }
        } else {
          if (f[8] <= -0.000669) {
            return -0.061878;
          } else {
            return 0.012842;
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[30] <= 0.040100) {
            if (f[3] <= 0.000332) {
              return -0.037014;
            } else {
              return -0.001390;
            }
          } else {
            if (f[21] <= 0.000081) {
              return 0.027671;
            } else {
              return -0.006330;
            }
          }
        } else {
          if (f[40] <= 0.519555) {
            if (f[23] <= 2.217167) {
              return -0.021132;
            } else {
              return -0.045638;
            }
          } else {
            if (f[35] <= 0.901431) {
              return 0.028036;
            } else {
              return -0.015025;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[8] <= -0.000152) {
        if (f[22] <= -0.909048) {
          if (f[30] <= 0.018124) {
            return 0.048543;
          } else {
            if (f[39] <= 0.299827) {
              return -0.007188;
            } else {
              return 0.055864;
            }
          }
        } else {
          if (f[36] <= 0.696868) {
            if (f[39] <= 0.133801) {
              return -0.020705;
            } else {
              return -0.058336;
            }
          } else {
            if (f[23] <= 0.268082) {
              return 0.049714;
            } else {
              return -0.000807;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[9] <= 0.000038) {
            if (f[6] <= -0.000016) {
              return 0.007847;
            } else {
              return -0.051008;
            }
          } else {
            if (f[22] <= -0.301102) {
              return 0.002531;
            } else {
              return 0.031691;
            }
          }
        } else {
          if (f[1] <= 0.028927) {
            if (f[37] <= 0.153481) {
              return 0.001436;
            } else {
              return -0.025828;
            }
          } else {
            if (f[9] <= 0.000125) {
              return -0.023416;
            } else {
              return 0.035580;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[22] <= 1.637878) {
            if (f[23] <= 0.236020) {
              return 0.035191;
            } else {
              return 0.052087;
            }
          } else {
            return 0.022023;
          }
        } else {
          if (f[31] <= 1.017909) {
            if (f[3] <= 0.001685) {
              return 0.031619;
            } else {
              return -0.019758;
            }
          } else {
            if (f[8] <= 0.000244) {
              return -0.037434;
            } else {
              return 0.040457;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[30] <= 0.040100) {
            if (f[3] <= 0.000337) {
              return -0.034278;
            } else {
              return -0.001097;
            }
          } else {
            if (f[21] <= 0.000081) {
              return 0.026786;
            } else {
              return -0.006181;
            }
          }
        } else {
          if (f[40] <= 0.513849) {
            if (f[20] <= 0.002582) {
              return -0.073511;
            } else {
              return -0.026233;
            }
          } else {
            if (f[3] <= 0.000649) {
              return 0.012667;
            } else {
              return -0.019695;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[3] <= 0.001685) {
          if (f[31] <= 1.017909) {
            if (f[14] <= 0.000164) {
              return 0.041334;
            } else {
              return 0.015532;
            }
          } else {
            if (f[8] <= 0.000244) {
              return -0.008444;
            } else {
              return 0.040414;
            }
          }
        } else {
          if (f[8] <= -0.000669) {
            return -0.056363;
          } else {
            return 0.011763;
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[30] <= 0.040100) {
            if (f[34] <= 0.018349) {
              return -0.056558;
            } else {
              return -0.006399;
            }
          } else {
            if (f[21] <= 0.000081) {
              return 0.026028;
            } else {
              return -0.005919;
            }
          }
        } else {
          if (f[40] <= 0.519555) {
            if (f[40] <= 0.506680) {
              return -0.033360;
            } else {
              return -0.014899;
            }
          } else {
            if (f[35] <= 0.901431) {
              return 0.027224;
            } else {
              return -0.014218;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[1] <= -0.052339) {
          return -0.040142;
        } else {
          if (f[23] <= 0.947829) {
            if (f[31] <= 1.002184) {
              return 0.028642;
            } else {
              return -0.009334;
            }
          } else {
            if (f[14] <= 0.000088) {
              return 0.048289;
            } else {
              return 0.026074;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[33] <= -0.210526) {
            if (f[1] <= -0.013132) {
              return -0.002822;
            } else {
              return 0.038021;
            }
          } else {
            if (f[30] <= 0.040100) {
              return -0.019058;
            } else {
              return 0.009428;
            }
          }
        } else {
          if (f[40] <= 0.527482) {
            if (f[40] <= 0.506680) {
              return -0.031719;
            } else {
              return -0.011798;
            }
          } else {
            if (f[23] <= 0.978421) {
              return -0.012503;
            } else {
              return 0.033766;
            }
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[3] <= 0.001685) {
          if (f[31] <= 1.017909) {
            if (f[6] <= 0.000170) {
              return 0.037603;
            } else {
              return -0.013012;
            }
          } else {
            if (f[23] <= 0.772803) {
              return -0.025195;
            } else {
              return 0.033604;
            }
          }
        } else {
          if (f[37] <= 0.201873) {
            return -0.052913;
          } else {
            return 0.007762;
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[29] <= 0.038754) {
            if (f[14] <= 0.000094) {
              return 0.003445;
            } else {
              return -0.031410;
            }
          } else {
            if (f[31] <= 1.118524) {
              return 0.023024;
            } else {
              return -0.028842;
            }
          }
        } else {
          if (f[40] <= 0.519555) {
            if (f[23] <= -0.545672) {
              return -0.086293;
            } else {
              return -0.020122;
            }
          } else {
            if (f[35] <= 0.901431) {
              return 0.026251;
            } else {
              return -0.013518;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[1] <= -0.007035) {
            return 0.020070;
          } else {
            if (f[23] <= 0.236020) {
              return 0.032655;
            } else {
              return 0.049872;
            }
          }
        } else {
          if (f[31] <= 1.017909) {
            if (f[37] <= 0.085912) {
              return 0.032960;
            } else {
              return -0.003533;
            }
          } else {
            if (f[8] <= 0.000244) {
              return -0.035247;
            } else {
              return 0.038395;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[33] <= -0.210526) {
            if (f[1] <= -0.013132) {
              return -0.002908;
            } else {
              return 0.036935;
            }
          } else {
            if (f[30] <= 0.040100) {
              return -0.017821;
            } else {
              return 0.008691;
            }
          }
        } else {
          if (f[40] <= 0.527482) {
            if (f[40] <= 0.506680) {
              return -0.029180;
            } else {
              return -0.010637;
            }
          } else {
            if (f[23] <= 0.978421) {
              return -0.012095;
            } else {
              return 0.032627;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[22] <= 1.637878) {
            if (f[23] <= 0.236020) {
              return 0.031902;
            } else {
              return 0.049353;
            }
          } else {
            return 0.016633;
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[37] <= 0.122280) {
              return 0.016665;
            } else {
              return -0.037234;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.003857;
            } else {
              return 0.044378;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[33] <= -0.000000) {
            if (f[30] <= 0.020741) {
              return -0.018360;
            } else {
              return 0.020956;
            }
          } else {
            if (f[34] <= 0.058546) {
              return -0.046228;
            } else {
              return -0.002611;
            }
          }
        } else {
          if (f[40] <= 0.513849) {
            if (f[10] <= 0.000013) {
              return -0.029461;
            } else {
              return -0.009077;
            }
          } else {
            if (f[3] <= 0.000649) {
              return 0.012591;
            } else {
              return -0.018481;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[23] <= -0.583832) {
        return -0.052536;
      } else {
        if (f[28] <= 0.769094) {
          if (f[23] <= 1.967348) {
            if (f[23] <= 0.772803) {
              return 0.009164;
            } else {
              return 0.045162;
            }
          } else {
            if (f[3] <= 0.000479) {
              return -0.048142;
            } else {
              return 0.028819;
            }
          }
        } else {
          if (f[8] <= -0.000204) {
            if (f[22] <= -0.706730) {
              return 0.010933;
            } else {
              return -0.029902;
            }
          } else {
            if (f[33] <= -0.210526) {
              return 0.013632;
            } else {
              return -0.001740;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[23] <= -0.583832) {
        return -0.049781;
      } else {
        if (f[28] <= 0.769094) {
          if (f[23] <= 1.890896) {
            if (f[23] <= 0.772803) {
              return 0.008832;
            } else {
              return 0.045520;
            }
          } else {
            if (f[32] <= 0.000096) {
              return -0.043919;
            } else {
              return 0.036304;
            }
          }
        } else {
          if (f[1] <= 0.026302) {
            if (f[1] <= 0.022850) {
              return -0.001418;
            } else {
              return -0.054930;
            }
          } else {
            if (f[36] <= 0.813091) {
              return 0.030166;
            } else {
              return -0.013656;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[40] <= 0.485231) {
        if (f[25] <= 0.500000) {
          if (f[1] <= -0.007699) {
            return -0.005242;
          } else {
            if (f[40] <= 0.482832) {
              return 0.046990;
            } else {
              return 0.023437;
            }
          }
        } else {
          if (f[23] <= -0.242469) {
            if (f[29] <= 0.027174) {
              return 0.054741;
            } else {
              return 0.041569;
            }
          } else {
            if (f[8] <= 0.000378) {
              return 0.002106;
            } else {
              return 0.032704;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[40] <= 0.497992) {
            if (f[0] <= 42.715669) {
              return 0.027491;
            } else {
              return -0.006575;
            }
          } else {
            if (f[40] <= 0.506680) {
              return -0.026776;
            } else {
              return -0.009461;
            }
          }
        } else {
          if (f[23] <= 0.978421) {
            if (f[37] <= 0.018902) {
              return 0.015295;
            } else {
              return -0.069196;
            }
          } else {
            if (f[23] <= 7.311949) {
              return 0.049640;
            } else {
              return -0.006205;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[13] <= 0.000132) {
            if (f[27] <= 0.222701) {
              return 0.043521;
            } else {
              return 0.050497;
            }
          } else {
            return 0.023630;
          }
        } else {
          if (f[31] <= 1.017909) {
            if (f[28] <= 0.929373) {
              return 0.039441;
            } else {
              return 0.009928;
            }
          } else {
            if (f[8] <= 0.000244) {
              return -0.034466;
            } else {
              return 0.036405;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[40] <= 0.497992) {
            if (f[33] <= -0.210526) {
              return 0.025442;
            } else {
              return -0.005213;
            }
          } else {
            if (f[20] <= 0.002582) {
              return -0.040128;
            } else {
              return -0.012755;
            }
          }
        } else {
          if (f[23] <= 0.978421) {
            if (f[28] <= 0.772269) {
              return 0.045025;
            } else {
              return -0.032726;
            }
          } else {
            if (f[23] <= 7.311949) {
              return 0.048871;
            } else {
              return -0.005939;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[22] <= 1.637878) {
            if (f[23] <= 0.236020) {
              return 0.029105;
            } else {
              return 0.047662;
            }
          } else {
            return 0.013432;
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[37] <= 0.122280) {
              return 0.015095;
            } else {
              return -0.036655;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.004613;
            } else {
              return 0.043033;
            }
          }
        }
      } else {
        if (f[23] <= -0.583832) {
          return -0.059095;
        } else {
          if (f[40] <= 0.540034) {
            if (f[40] <= 0.497992) {
              return 0.003131;
            } else {
              return -0.011814;
            }
          } else {
            if (f[32] <= 0.000044) {
              return 0.012574;
            } else {
              return 0.052296;
            }
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[40] <= 0.481663) {
        if (f[25] <= 0.500000) {
          if (f[14] <= 0.000100) {
            return 0.048062;
          } else {
            if (f[40] <= 0.475476) {
              return 0.049581;
            } else {
              return 0.003109;
            }
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[37] <= 0.122280) {
              return 0.014596;
            } else {
              return -0.033108;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.005961;
            } else {
              return 0.043988;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[14] <= 0.000088) {
            if (f[31] <= 1.065191) {
              return 0.015459;
            } else {
              return -0.034140;
            }
          } else {
            if (f[34] <= 0.070857) {
              return -0.042004;
            } else {
              return -0.003651;
            }
          }
        } else {
          if (f[40] <= 0.513849) {
            if (f[14] <= -0.000006) {
              return -0.027138;
            } else {
              return -0.008242;
            }
          } else {
            if (f[3] <= 0.000649) {
              return 0.012640;
            } else {
              return -0.016442;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[28] <= 0.769094) {
        if (f[23] <= 1.967348) {
          if (f[23] <= 0.772803) {
            if (f[22] <= -0.279694) {
              return -0.037910;
            } else {
              return 0.016326;
            }
          } else {
            if (f[39] <= 0.100291) {
              return 0.047213;
            } else {
              return 0.024592;
            }
          }
        } else {
          if (f[9] <= 0.000087) {
            return -0.046730;
          } else {
            return 0.036020;
          }
        }
      } else {
        if (f[23] <= 0.660536) {
          if (f[22] <= 0.160890) {
            if (f[23] <= 0.201585) {
              return -0.007557;
            } else {
              return -0.033077;
            }
          } else {
            if (f[3] <= 0.000140) {
              return -0.065317;
            } else {
              return 0.006816;
            }
          }
        } else {
          if (f[3] <= 0.000642) {
            if (f[35] <= 0.997770) {
              return 0.017892;
            } else {
              return -0.001877;
            }
          } else {
            if (f[1] <= 0.026302) {
              return -0.013921;
            } else {
              return 0.024980;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[28] <= 0.769094) {
        if (f[20] <= 0.002583) {
          if (f[3] <= 0.000356) {
            if (f[22] <= -0.157581) {
              return 0.002424;
            } else {
              return 0.034604;
            }
          } else {
            if (f[31] <= 0.797816) {
              return 0.049199;
            } else {
              return -0.030996;
            }
          }
        } else {
          if (f[2] <= 0.877246) {
            if (f[8] <= -0.000064) {
              return 0.025998;
            } else {
              return 0.051147;
            }
          } else {
            return -0.007646;
          }
        }
      } else {
        if (f[33] <= 0.210526) {
          if (f[32] <= 0.000106) {
            if (f[8] <= -0.000282) {
              return -0.037794;
            } else {
              return 0.004104;
            }
          } else {
            if (f[22] <= -0.716404) {
              return 0.010588;
            } else {
              return -0.019491;
            }
          }
        } else {
          if (f[32] <= 0.000096) {
            if (f[25] <= 0.500000) {
              return 0.015184;
            } else {
              return -0.056160;
            }
          } else {
            if (f[27] <= 0.125798) {
              return 0.016426;
            } else {
              return 0.046071;
            }
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[40] <= 0.482832) {
        if (f[25] <= 0.500000) {
          if (f[22] <= 1.637878) {
            if (f[23] <= 0.236020) {
              return 0.027698;
            } else {
              return 0.046544;
            }
          } else {
            return 0.011557;
          }
        } else {
          if (f[31] <= 1.017909) {
            if (f[37] <= 0.085912) {
              return 0.029837;
            } else {
              return -0.004556;
            }
          } else {
            if (f[8] <= 0.000244) {
              return -0.033727;
            } else {
              return 0.034601;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[31] <= 1.035085) {
              return 0.030524;
            } else {
              return -0.024853;
            }
          } else {
            if (f[40] <= 0.507342) {
              return -0.030151;
            } else {
              return 0.004095;
            }
          }
        } else {
          if (f[23] <= -0.583832) {
            return -0.076849;
          } else {
            if (f[38] <= 1.000000) {
              return -0.006606;
            } else {
              return -0.037392;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[40] <= 0.481663) {
        if (f[25] <= 0.500000) {
          if (f[14] <= 0.000100) {
            if (f[9] <= 0.000102) {
              return 0.048742;
            } else {
              return 0.033973;
            }
          } else {
            if (f[40] <= 0.475476) {
              return 0.048603;
            } else {
              return 0.001324;
            }
          }
        } else {
          if (f[38] <= 1.000000) {
            if (f[34] <= 0.032440) {
              return 0.037367;
            } else {
              return -0.000457;
            }
          } else {
            if (f[10] <= -0.000057) {
              return 0.012701;
            } else {
              return 0.047954;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[31] <= 1.035085) {
              return 0.029572;
            } else {
              return -0.023633;
            }
          } else {
            if (f[40] <= 0.507342) {
              return -0.028787;
            } else {
              return 0.003936;
            }
          }
        } else {
          if (f[23] <= -0.583832) {
            return -0.068793;
          } else {
            if (f[38] <= 1.000000) {
              return -0.006048;
            } else {
              return -0.035514;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[40] <= 0.485231) {
        if (f[31] <= 0.993752) {
          if (f[0] <= 40.575569) {
            return -0.003812;
          } else {
            if (f[14] <= 0.000157) {
              return 0.039126;
            } else {
              return 0.007611;
            }
          }
        } else {
          if (f[23] <= 0.660536) {
            if (f[7] <= 0.000144) {
              return -0.064420;
            } else {
              return 0.008685;
            }
          } else {
            if (f[38] <= 0.764372) {
              return -0.034185;
            } else {
              return 0.035240;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[3] <= 0.000637) {
            if (f[33] <= -0.210526) {
              return 0.007580;
            } else {
              return -0.008635;
            }
          } else {
            if (f[36] <= 0.445941) {
              return -0.063938;
            } else {
              return -0.013673;
            }
          }
        } else {
          if (f[23] <= 1.036166) {
            if (f[28] <= 0.755377) {
              return 0.052512;
            } else {
              return -0.029150;
            }
          } else {
            if (f[23] <= 7.311949) {
              return 0.050179;
            } else {
              return -0.005918;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[40] <= 0.481663) {
        if (f[25] <= 0.500000) {
          if (f[13] <= 0.000132) {
            if (f[22] <= -0.357025) {
              return 0.039446;
            } else {
              return 0.048254;
            }
          } else {
            return 0.024744;
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[22] <= -0.450535) {
              return 0.025387;
            } else {
              return -0.015547;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.007700;
            } else {
              return 0.042451;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[40] <= 0.497992) {
            if (f[30] <= 0.040100) {
              return -0.008675;
            } else {
              return 0.014706;
            }
          } else {
            if (f[20] <= 0.002582) {
              return -0.036547;
            } else {
              return -0.009725;
            }
          }
        } else {
          if (f[35] <= 0.960211) {
            if (f[3] <= 0.000891) {
              return 0.037623;
            } else {
              return -0.008137;
            }
          } else {
            if (f[37] <= 0.091230) {
              return 0.015436;
            } else {
              return -0.062079;
            }
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[40] <= 0.481663) {
        if (f[3] <= 0.001685) {
          if (f[23] <= 0.935619) {
            if (f[31] <= 1.002184) {
              return 0.024791;
            } else {
              return -0.011744;
            }
          } else {
            if (f[14] <= 0.000088) {
              return 0.044494;
            } else {
              return 0.018742;
            }
          }
        } else {
          return -0.025142;
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[31] <= 1.035085) {
              return 0.028606;
            } else {
              return -0.022264;
            }
          } else {
            if (f[40] <= 0.507342) {
              return -0.026956;
            } else {
              return 0.004016;
            }
          }
        } else {
          if (f[23] <= -0.583832) {
            return -0.064897;
          } else {
            if (f[38] <= 1.000000) {
              return -0.005332;
            } else {
              return -0.033183;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[40] <= 0.485231) {
        if (f[31] <= 0.993752) {
          if (f[28] <= 0.929373) {
            return 0.037382;
          } else {
            if (f[37] <= 0.098528) {
              return 0.022661;
            } else {
              return -0.013373;
            }
          }
        } else {
          if (f[23] <= 0.660536) {
            if (f[7] <= 0.000144) {
              return -0.060139;
            } else {
              return 0.008453;
            }
          } else {
            if (f[38] <= 0.764372) {
              return -0.033669;
            } else {
              return 0.033719;
            }
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[3] <= 0.000637) {
            if (f[30] <= 0.040100) {
              return -0.012307;
            } else {
              return 0.002149;
            }
          } else {
            if (f[36] <= 0.445941) {
              return -0.059834;
            } else {
              return -0.012525;
            }
          }
        } else {
          if (f[23] <= 1.036166) {
            if (f[37] <= 0.018902) {
              return 0.016169;
            } else {
              return -0.055577;
            }
          } else {
            if (f[23] <= 7.311949) {
              return 0.049325;
            } else {
              return -0.005964;
            }
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[3] <= 0.001987) {
          if (f[23] <= 0.772803) {
            if (f[23] <= 0.523779) {
              return 0.029822;
            } else {
              return -0.033518;
            }
          } else {
            if (f[14] <= 0.000132) {
              return 0.046242;
            } else {
              return 0.025882;
            }
          }
        } else {
          return -0.024980;
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[6] <= 0.000051) {
            if (f[31] <= 1.061594) {
              return 0.015525;
            } else {
              return -0.021615;
            }
          } else {
            if (f[23] <= -0.175770) {
              return 0.048761;
            } else {
              return -0.016716;
            }
          }
        } else {
          if (f[40] <= 0.506680) {
            if (f[12] <= 0.000013) {
              return -0.033155;
            } else {
              return 0.000624;
            }
          } else {
            if (f[3] <= 0.000603) {
              return 0.006723;
            } else {
              return -0.015238;
            }
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[40] <= 0.481811) {
        if (f[25] <= 0.500000) {
          if (f[3] <= 0.000669) {
            if (f[23] <= 0.236020) {
              return 0.023320;
            } else {
              return 0.044097;
            }
          } else {
            return 0.003128;
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[22] <= -0.450535) {
              return 0.024042;
            } else {
              return -0.015800;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.007069;
            } else {
              return 0.041093;
            }
          }
        }
      } else {
        if (f[40] <= 0.540034) {
          if (f[33] <= -0.210526) {
            if (f[22] <= -0.385108) {
              return -0.018998;
            } else {
              return 0.013014;
            }
          } else {
            if (f[23] <= -0.583832) {
              return -0.061941;
            } else {
              return -0.007654;
            }
          }
        } else {
          if (f[31] <= 0.850096) {
            return 0.010241;
          } else {
            if (f[29] <= 0.044610) {
              return 0.049783;
            } else {
              return 0.051638;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[29] <= 0.143154) {
        if (f[1] <= 0.026302) {
          if (f[21] <= 0.000321) {
            if (f[37] <= 0.153481) {
              return 0.001317;
            } else {
              return -0.013799;
            }
          } else {
            if (f[3] <= 0.000642) {
              return 0.016497;
            } else {
              return -0.051716;
            }
          }
        } else {
          if (f[36] <= 0.813091) {
            if (f[32] <= 0.000111) {
              return -0.017661;
            } else {
              return 0.036307;
            }
          } else {
            if (f[28] <= 0.963208) {
              return -0.057885;
            } else {
              return 0.023057;
            }
          }
        }
      } else {
        if (f[34] <= 0.124099) {
          if (f[23] <= 0.352774) {
            if (f[35] <= 0.859731) {
              return -0.035775;
            } else {
              return 0.024732;
            }
          } else {
            if (f[38] <= 1.000000) {
              return 0.051414;
            } else {
              return 0.021526;
            }
          }
        } else {
          return -0.019942;
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[1] <= -0.056404) {
          return -0.047570;
        } else {
          if (f[23] <= 0.772803) {
            if (f[23] <= 0.523779) {
              return 0.028868;
            } else {
              return -0.032072;
            }
          } else {
            if (f[37] <= 0.195916) {
              return 0.043626;
            } else {
              return 0.019414;
            }
          }
        }
      } else {
        if (f[40] <= 0.497992) {
          if (f[6] <= 0.000051) {
            if (f[31] <= 1.061594) {
              return 0.014975;
            } else {
              return -0.020764;
            }
          } else {
            if (f[23] <= -0.175770) {
              return 0.047930;
            } else {
              return -0.015829;
            }
          }
        } else {
          if (f[40] <= 0.513849) {
            if (f[20] <= 0.002582) {
              return -0.053321;
            } else {
              return -0.013446;
            }
          } else {
            if (f[3] <= 0.000649) {
              return 0.012364;
            } else {
              return -0.011912;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[1] <= 0.031363) {
        if (f[21] <= 0.000321) {
          if (f[23] <= 0.589323) {
            if (f[20] <= 0.002582) {
              return -0.046932;
            } else {
              return -0.002961;
            }
          } else {
            if (f[35] <= 1.052824) {
              return 0.010831;
            } else {
              return -0.005161;
            }
          }
        } else {
          if (f[31] <= 0.777886) {
            return -0.067749;
          } else {
            if (f[22] <= 0.279102) {
              return -0.032992;
            } else {
              return 0.016324;
            }
          }
        }
      } else {
        if (f[36] <= 0.813091) {
          if (f[9] <= 0.000130) {
            return 0.000882;
          } else {
            if (f[24] <= 0.041667) {
              return 0.029759;
            } else {
              return 0.055836;
            }
          }
        } else {
          return -0.011152;
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[1] <= -0.056404) {
          return -0.045477;
        } else {
          if (f[23] <= 0.772803) {
            if (f[23] <= 0.523779) {
              return 0.028177;
            } else {
              return -0.030436;
            }
          } else {
            if (f[14] <= 0.000088) {
              return 0.046646;
            } else {
              return 0.026640;
            }
          }
        }
      } else {
        if (f[40] <= 0.495356) {
          if (f[14] <= 0.000088) {
            if (f[31] <= 0.993752) {
              return 0.019111;
            } else {
              return -0.012092;
            }
          } else {
            if (f[29] <= 0.013557) {
              return -0.035886;
            } else {
              return 0.000178;
            }
          }
        } else {
          if (f[40] <= 0.519555) {
            if (f[29] <= 0.029258) {
              return -0.021669;
            } else {
              return -0.004625;
            }
          } else {
            if (f[35] <= 0.901431) {
              return 0.025061;
            } else {
              return -0.010483;
            }
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[8] <= -0.000669) {
          return -0.017894;
        } else {
          if (f[31] <= 1.004754) {
            if (f[2] <= 1.044912) {
              return 0.040940;
            } else {
              return 0.005850;
            }
          } else {
            if (f[40] <= 0.463117) {
              return 0.036675;
            } else {
              return -0.009609;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[21] <= -0.000183) {
              return -0.002431;
            } else {
              return 0.030196;
            }
          } else {
            if (f[8] <= -0.000590) {
              return 0.051918;
            } else {
              return -0.008000;
            }
          }
        } else {
          if (f[0] <= 32.541527) {
            if (f[31] <= 0.956941) {
              return -0.044271;
            } else {
              return 0.013642;
            }
          } else {
            if (f[2] <= 0.900846) {
              return -0.000888;
            } else {
              return -0.019248;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[40] <= 0.485231) {
        if (f[31] <= 0.993752) {
          if (f[0] <= 40.575569) {
            if (f[22] <= -1.004276) {
              return 0.027240;
            } else {
              return -0.032405;
            }
          } else {
            if (f[2] <= 0.900846) {
              return 0.034928;
            } else {
              return 0.002074;
            }
          }
        } else {
          if (f[8] <= 0.000259) {
            if (f[23] <= 0.793709) {
              return -0.046308;
            } else {
              return 0.008484;
            }
          } else {
            return 0.031643;
          }
        }
      } else {
        if (f[40] <= 0.527482) {
          if (f[1] <= 0.016206) {
            if (f[23] <= -0.583832) {
              return -0.049275;
            } else {
              return -0.002957;
            }
          } else {
            if (f[9] <= 0.000108) {
              return -0.042833;
            } else {
              return -0.003331;
            }
          }
        } else {
          if (f[23] <= 1.036166) {
            if (f[28] <= 0.755377) {
              return 0.050870;
            } else {
              return -0.026232;
            }
          } else {
            if (f[23] <= 6.668402) {
              return 0.051254;
            } else {
              return -0.002832;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[1] <= -0.056404) {
          return -0.043143;
        } else {
          if (f[23] <= 0.660536) {
            if (f[23] <= 0.523779) {
              return 0.026661;
            } else {
              return -0.042737;
            }
          } else {
            if (f[38] <= 0.810833) {
              return 0.020684;
            } else {
              return 0.044619;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[28] <= 0.970234) {
              return 0.026703;
            } else {
              return -0.029223;
            }
          } else {
            if (f[39] <= 0.127729) {
              return 0.001824;
            } else {
              return -0.036652;
            }
          }
        } else {
          if (f[30] <= 0.006790) {
            if (f[22] <= -0.094070) {
              return -0.003037;
            } else {
              return -0.078913;
            }
          } else {
            if (f[23] <= -0.583832) {
              return -0.051739;
            } else {
              return -0.003839;
            }
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[29] <= 0.143154) {
        if (f[1] <= 0.026302) {
          if (f[1] <= 0.022850) {
            if (f[37] <= 0.153481) {
              return 0.001355;
            } else {
              return -0.014318;
            }
          } else {
            if (f[24] <= 0.041667) {
              return -0.000951;
            } else {
              return -0.053187;
            }
          }
        } else {
          if (f[36] <= 0.813091) {
            if (f[32] <= 0.000119) {
              return 0.001881;
            } else {
              return 0.039772;
            }
          } else {
            if (f[0] <= 77.142855) {
              return 0.023810;
            } else {
              return -0.052635;
            }
          }
        }
      } else {
        if (f[34] <= 0.124099) {
          if (f[23] <= 0.352774) {
            if (f[35] <= 0.859731) {
              return -0.035045;
            } else {
              return 0.023883;
            }
          } else {
            if (f[38] <= 1.000000) {
              return 0.050656;
            } else {
              return 0.020580;
            }
          }
        } else {
          return -0.018916;
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[40] <= 0.481811) {
        if (f[25] <= 0.500000) {
          if (f[3] <= 0.000686) {
            if (f[2] <= 1.005978) {
              return 0.043063;
            } else {
              return 0.023754;
            }
          } else {
            return -0.006949;
          }
        } else {
          if (f[22] <= 0.137242) {
            if (f[22] <= -0.450535) {
              return 0.022160;
            } else {
              return -0.016994;
            }
          } else {
            if (f[25] <= 0.750000) {
              return -0.009070;
            } else {
              return 0.039224;
            }
          }
        }
      } else {
        if (f[30] <= 0.040100) {
          if (f[34] <= 0.018349) {
            if (f[9] <= 0.000127) {
              return -0.023058;
            } else {
              return -0.085716;
            }
          } else {
            if (f[20] <= 0.002583) {
              return -0.011393;
            } else {
              return 0.008541;
            }
          }
        } else {
          if (f[40] <= 0.499684) {
            if (f[36] <= 0.748156) {
              return 0.019971;
            } else {
              return -0.017400;
            }
          } else {
            if (f[40] <= 0.506680) {
              return -0.021991;
            } else {
              return 0.000590;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[29] <= 0.143154) {
        if (f[1] <= 0.031363) {
          if (f[15] <= 0.000339) {
            if (f[23] <= 0.546137) {
              return -0.006506;
            } else {
              return 0.003762;
            }
          } else {
            if (f[37] <= 0.054683) {
              return -0.002295;
            } else {
              return -0.049661;
            }
          }
        } else {
          if (f[36] <= 0.813091) {
            if (f[32] <= 0.000119) {
              return -0.004408;
            } else {
              return 0.045752;
            }
          } else {
            return -0.010632;
          }
        }
      } else {
        if (f[34] <= 0.124099) {
          if (f[23] <= 0.352774) {
            if (f[35] <= 0.859731) {
              return -0.033259;
            } else {
              return 0.023051;
            }
          } else {
            if (f[38] <= 1.000000) {
              return 0.049908;
            } else {
              return 0.019873;
            }
          }
        } else {
          return -0.018306;
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[8] <= -0.000877) {
          return -0.041026;
        } else {
          if (f[23] <= 0.660536) {
            if (f[23] <= 0.523779) {
              return 0.025872;
            } else {
              return -0.040532;
            }
          } else {
            if (f[38] <= 0.830913) {
              return 0.019760;
            } else {
              return 0.043640;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[23] <= 6.579819) {
              return 0.026217;
            } else {
              return -0.017949;
            }
          } else {
            if (f[8] <= -0.000590) {
              return 0.050513;
            } else {
              return -0.007121;
            }
          }
        } else {
          if (f[40] <= 0.540034) {
            if (f[36] <= 0.561906) {
              return -0.012328;
            } else {
              return -0.000351;
            }
          } else {
            return 0.043631;
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[40] <= 0.485231) {
        if (f[31] <= 1.017909) {
          if (f[28] <= 0.929373) {
            if (f[0] <= 40.740740) {
              return 0.006807;
            } else {
              return 0.041184;
            }
          } else {
            if (f[23] <= -0.232713) {
              return 0.051602;
            } else {
              return 0.002555;
            }
          }
        } else {
          if (f[23] <= 0.660536) {
            if (f[1] <= 0.009470) {
              return -0.075514;
            } else {
              return 0.002655;
            }
          } else {
            if (f[38] <= 0.764372) {
              return -0.039435;
            } else {
              return 0.031337;
            }
          }
        }
      } else {
        if (f[40] <= 0.541243) {
          if (f[0] <= 72.413792) {
            if (f[38] <= 1.000000) {
              return -0.001341;
            } else {
              return -0.025542;
            }
          } else {
            if (f[22] <= 1.259629) {
              return -0.015891;
            } else {
              return -0.066965;
            }
          }
        } else {
          if (f[35] <= 0.689926) {
            return 0.049687;
          } else {
            return 0.023946;
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[1] <= -0.056404) {
          return -0.040729;
        } else {
          if (f[23] <= 0.772803) {
            if (f[23] <= 0.523779) {
              return 0.025067;
            } else {
              return -0.027401;
            }
          } else {
            if (f[14] <= 0.000088) {
              return 0.044984;
            } else {
              return 0.022631;
            }
          }
        }
      } else {
        if (f[33] <= -0.210526) {
          if (f[40] <= 0.499940) {
            if (f[28] <= 0.970234) {
              return 0.025129;
            } else {
              return -0.028509;
            }
          } else {
            if (f[39] <= 0.127729) {
              return 0.002272;
            } else {
              return -0.034669;
            }
          }
        } else {
          if (f[30] <= 0.006790) {
            if (f[40] <= 0.492680) {
              return -0.070685;
            } else {
              return -0.010710;
            }
          } else {
            if (f[23] <= -0.583832) {
              return -0.049195;
            } else {
              return -0.003342;
            }
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[1] <= 0.031363) {
        if (f[15] <= 0.000339) {
          if (f[32] <= 0.000106) {
            if (f[1] <= -0.016310) {
              return -0.029529;
            } else {
              return 0.005673;
            }
          } else {
            if (f[26] <= 0.031024) {
              return -0.016820;
            } else {
              return 0.007357;
            }
          }
        } else {
          if (f[18] <= 0.000000) {
            if (f[31] <= 1.000010) {
              return -0.011803;
            } else {
              return 0.049019;
            }
          } else {
            if (f[9] <= 0.000089) {
              return 0.007427;
            } else {
              return -0.054449;
            }
          }
        }
      } else {
        if (f[36] <= 0.813091) {
          if (f[32] <= 0.000119) {
            return -0.004420;
          } else {
            if (f[24] <= 0.041667) {
              return 0.026020;
            } else {
              return 0.054532;
            }
          }
        } else {
          return -0.010214;
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[3] <= 0.001987) {
          if (f[31] <= 1.004754) {
            if (f[2] <= 1.044912) {
              return 0.038668;
            } else {
              return -0.001949;
            }
          } else {
            if (f[40] <= 0.463117) {
              return 0.034165;
            } else {
              return -0.011628;
            }
          }
        } else {
          return -0.023175;
        }
      } else {
        if (f[2] <= 0.900846) {
          if (f[40] <= 0.497992) {
            if (f[31] <= 1.061594) {
              return 0.011080;
            } else {
              return -0.023357;
            }
          } else {
            if (f[40] <= 0.506680) {
              return -0.018426;
            } else {
              return 0.001958;
            }
          }
        } else {
          if (f[32] <= 0.000075) {
            if (f[9] <= 0.000043) {
              return -0.024809;
            } else {
              return 0.026200;
            }
          } else {
            if (f[0] <= 79.999995) {
              return -0.035074;
            } else {
              return 0.008582;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[40] <= 0.481811) {
        if (f[25] <= 0.500000) {
          if (f[16] <= 0.000000) {
            if (f[2] <= 1.005978) {
              return 0.042059;
            } else {
              return 0.021413;
            }
          } else {
            return -0.008603;
          }
        } else {
          if (f[38] <= 1.000000) {
            if (f[34] <= 0.032440) {
              return 0.032170;
            } else {
              return -0.005359;
            }
          } else {
            if (f[12] <= -0.000057) {
              return 0.002585;
            } else {
              return 0.044519;
            }
          }
        }
      } else {
        if (f[40] <= 0.541243) {
          if (f[9] <= 0.000029) {
            return -0.054120;
          } else {
            if (f[33] <= -0.210526) {
              return 0.006067;
            } else {
              return -0.006019;
            }
          }
        } else {
          if (f[38] <= 1.000000) {
            return 0.024165;
          } else {
            return 0.049299;
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[1] <= -0.056404) {
          return -0.038630;
        } else {
          if (f[23] <= 0.660536) {
            if (f[23] <= 0.523779) {
              return 0.023457;
            } else {
              return -0.037396;
            }
          } else {
            if (f[38] <= 0.810833) {
              return 0.017541;
            } else {
              return 0.042722;
            }
          }
        }
      } else {
        if (f[40] <= 0.541243) {
          if (f[40] <= 0.497992) {
            if (f[6] <= 0.000051) {
              return 0.009793;
            } else {
              return -0.009493;
            }
          } else {
            if (f[38] <= 1.000000) {
              return -0.004509;
            } else {
              return -0.035816;
            }
          }
        } else {
          if (f[35] <= 0.689926) {
            return 0.048851;
          } else {
            return 0.022304;
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[29] <= 0.143154) {
        if (f[33] <= 0.210526) {
          if (f[22] <= -0.123911) {
            if (f[3] <= 0.000238) {
              return -0.032121;
            } else {
              return -0.005291;
            }
          } else {
            if (f[3] <= 0.000548) {
              return 0.008706;
            } else {
              return -0.008780;
            }
          }
        } else {
          if (f[9] <= 0.000161) {
            if (f[22] <= -0.936332) {
              return 0.040656;
            } else {
              return -0.000231;
            }
          } else {
            if (f[14] <= -0.000000) {
              return 0.013395;
            } else {
              return 0.055549;
            }
          }
        }
      } else {
        if (f[34] <= 0.124099) {
          if (f[23] <= 0.352774) {
            if (f[35] <= 0.859731) {
              return -0.033282;
            } else {
              return 0.021996;
            }
          } else {
            if (f[38] <= 1.000000) {
              return 0.049254;
            } else {
              return 0.019828;
            }
          }
        } else {
          return -0.016868;
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[40] <= 0.474341) {
        if (f[3] <= 0.001987) {
          if (f[23] <= 0.772803) {
            if (f[23] <= 0.008568) {
              return 0.041887;
            } else {
              return -0.006725;
            }
          } else {
            if (f[14] <= 0.000132) {
              return 0.042220;
            } else {
              return 0.017247;
            }
          }
        } else {
          return -0.021807;
        }
      } else {
        if (f[30] <= 0.006790) {
          if (f[7] <= 0.000011) {
            return 0.009447;
          } else {
            return -0.058559;
          }
        } else {
          if (f[40] <= 0.495356) {
            if (f[23] <= -0.254035) {
              return 0.037345;
            } else {
              return 0.002332;
            }
          } else {
            if (f[40] <= 0.513849) {
              return -0.009900;
            } else {
              return 0.004322;
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
