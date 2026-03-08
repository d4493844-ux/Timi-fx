
// ── ML Model: BOOM1000 ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: 500, Meta trees: 200
function predict_BOOMk(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[5] <= 0.000000) {
        if (f[15] <= -0.000296) {
          if (f[7] <= 0.000515) {
            if (f[0] <= 73.604139) {
              if (f[0] <= 66.309351) {
                if (f[9] <= 0.000148) {
                  return 0.013737;
                } else {
                  return 0.047011;
                }
              } else {
                if (f[16] <= -0.000599) {
                  return 0.019044;
                } else {
                  return -0.030999;
                }
              }
            } else {
              return 0.039136;
            }
          } else {
            if (f[14] <= -0.000183) {
              return 0.009704;
            } else {
              return -0.029665;
            }
          }
        } else {
          if (f[15] <= -0.000084) {
            if (f[12] <= 0.000056) {
              if (f[0] <= 63.705431) {
                if (f[2] <= 0.381006) {
                  return -0.006399;
                } else {
                  return 0.028787;
                }
              } else {
                return -0.032073;
              }
            } else {
              if (f[12] <= 0.000063) {
                return -0.037600;
              } else {
                return 0.000379;
              }
            }
          } else {
            if (f[16] <= 0.001019) {
              if (f[9] <= 0.000121) {
                return -0.007828;
              } else {
                if (f[9] <= 0.000187) {
                  return 0.028872;
                } else {
                  return -0.007651;
                }
              }
            } else {
              if (f[0] <= 74.254729) {
                if (f[0] <= 69.285531) {
                  return -0.011163;
                } else {
                  return -0.059151;
                }
              } else {
                if (f[16] <= 0.002373) {
                  return 0.019405;
                } else {
                  return -0.025387;
                }
              }
            }
          }
        }
      } else {
        if (f[0] <= 47.278078) {
          if (f[7] <= -0.000231) {
            if (f[7] <= -0.000588) {
              if (f[9] <= 0.000059) {
                return 0.049015;
              } else {
                if (f[9] <= 0.000060) {
                  return -0.034614;
                } else {
                  return 0.005848;
                }
              }
            } else {
              if (f[7] <= -0.000497) {
                if (f[9] <= 0.000058) {
                  return 0.009082;
                } else {
                  return -0.017405;
                }
              } else {
                if (f[2] <= 0.206857) {
                  return 0.001624;
                } else {
                  return -0.029839;
                }
              }
            }
          } else {
            if (f[2] <= 0.350959) {
              return 0.039101;
            } else {
              return -0.001120;
            }
          }
        } else {
          if (f[0] <= 54.525383) {
            return -0.059219;
          } else {
            if (f[9] <= 0.000133) {
              return 0.017772;
            } else {
              return -0.029620;
            }
          }
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.041634;
          } else {
            if (f[3] <= 0.001434) {
              if (f[13] <= -0.000057) {
                if (f[8] <= -0.001212) {
                  return -0.039420;
                } else {
                  return 0.000958;
                }
              } else {
                return -0.049159;
              }
            } else {
              if (f[13] <= -0.000061) {
                if (f[14] <= -0.000183) {
                  return -0.028680;
                } else {
                  return 0.016878;
                }
              } else {
                return 0.022041;
              }
            }
          }
        } else {
          if (f[15] <= -0.000285) {
            if (f[1] <= -2.331115) {
              if (f[7] <= -0.000497) {
                if (f[8] <= -0.000785) {
                  return -0.012640;
                } else {
                  return -0.058400;
                }
              } else {
                if (f[3] <= 0.001403) {
                  return 0.011099;
                } else {
                  return -0.023323;
                }
              }
            } else {
              return -0.057816;
            }
          } else {
            if (f[1] <= -3.540991) {
              return -0.042896;
            } else {
              return -0.003264;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000762) {
                  return 0.007105;
                } else {
                  return -0.026975;
                }
              } else {
                if (f[16] <= 0.000385) {
                  return -0.045508;
                } else {
                  return 0.000213;
                }
              }
            } else {
              return 0.039865;
            }
          } else {
            if (f[1] <= 2.523875) {
              return 0.040683;
            } else {
              return -0.007466;
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[0] <= 66.976498) {
                  return 0.002385;
                } else {
                  return -0.033446;
                }
              } else {
                return 0.028584;
              }
            } else {
              return -0.058394;
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[6] <= -0.000065) {
                return 0.038666;
              } else {
                if (f[16] <= 0.001944) {
                  return -0.002389;
                } else {
                  return 0.023217;
                }
              }
            } else {
              if (f[9] <= 0.000367) {
                if (f[14] <= -0.000000) {
                  return -0.058172;
                } else {
                  return -0.007094;
                }
              } else {
                return 0.002676;
              }
            }
          }
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001318) {
          if (f[16] <= -0.000597) {
            if (f[8] <= -0.001403) {
              return 0.018179;
            } else {
              return -0.027178;
            }
          } else {
            return 0.031974;
          }
        } else {
          if (f[10] <= -0.000070) {
            return 0.021196;
          } else {
            if (f[15] <= -0.000284) {
              if (f[8] <= -0.000759) {
                if (f[9] <= 0.000059) {
                  return 0.007320;
                } else {
                  return -0.012034;
                }
              } else {
                if (f[2] <= 0.091110) {
                  return 0.009495;
                } else {
                  return -0.044786;
                }
              }
            } else {
              if (f[12] <= 0.000055) {
                return -0.010322;
              } else {
                if (f[2] <= 0.140496) {
                  return -0.033664;
                } else {
                  return -0.057620;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[15] <= 0.000787) {
              if (f[15] <= 0.000616) {
                if (f[0] <= 47.278078) {
                  return 0.008459;
                } else {
                  return -0.007818;
                }
              } else {
                return 0.030527;
              }
            } else {
              return -0.027983;
            }
          } else {
            if (f[15] <= -0.000300) {
              return 0.046204;
            } else {
              if (f[15] <= 0.000432) {
                return -0.011732;
              } else {
                return 0.031784;
              }
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[9] <= 0.000182) {
                if (f[12] <= 0.000059) {
                  return -0.051506;
                } else {
                  return -0.009260;
                }
              } else {
                if (f[2] <= 0.679461) {
                  return 0.036050;
                } else {
                  return -0.005254;
                }
              }
            } else {
              return -0.056759;
            }
          } else {
            if (f[16] <= 0.002373) {
              if (f[15] <= 0.002105) {
                if (f[15] <= 0.001392) {
                  return 0.011448;
                } else {
                  return -0.025012;
                }
              } else {
                return 0.042399;
              }
            } else {
              if (f[9] <= 0.000367) {
                if (f[0] <= 83.266438) {
                  return -0.003177;
                } else {
                  return -0.057598;
                }
              } else {
                return 0.008814;
              }
            }
          }
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.040075;
          } else {
            if (f[3] <= 0.001434) {
              if (f[7] <= -0.000593) {
                return -0.014131;
              } else {
                if (f[15] <= -0.000289) {
                  return -0.057337;
                } else {
                  return -0.014400;
                }
              }
            } else {
              if (f[10] <= -0.000061) {
                if (f[14] <= -0.000183) {
                  return -0.027650;
                } else {
                  return 0.016506;
                }
              } else {
                if (f[15] <= -0.000311) {
                  return 0.044706;
                } else {
                  return 0.012443;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000285) {
            if (f[1] <= -2.331115) {
              if (f[7] <= -0.000497) {
                if (f[8] <= -0.000785) {
                  return -0.012129;
                } else {
                  return -0.056112;
                }
              } else {
                if (f[3] <= 0.001403) {
                  return 0.011007;
                } else {
                  return -0.021998;
                }
              }
            } else {
              return -0.055292;
            }
          } else {
            if (f[1] <= -3.540991) {
              return -0.040866;
            } else {
              return -0.002221;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[8] <= 0.000629) {
                if (f[6] <= -0.000212) {
                  return 0.028363;
                } else {
                  return 0.004656;
                }
              } else {
                if (f[19] <= 0.000000) {
                  return -0.029888;
                } else {
                  return 0.011192;
                }
              }
            } else {
              return 0.038391;
            }
          } else {
            if (f[1] <= 2.523875) {
              return 0.038666;
            } else {
              return -0.007782;
            }
          }
        } else {
          if (f[9] <= 0.000182) {
            if (f[1] <= 5.847266) {
              if (f[3] <= 0.002201) {
                if (f[16] <= 0.000833) {
                  return -0.003426;
                } else {
                  return -0.036670;
                }
              } else {
                return -0.056582;
              }
            } else {
              return 0.020359;
            }
          } else {
            if (f[3] <= 0.002027) {
              return -0.048101;
            } else {
              if (f[16] <= 0.002373) {
                if (f[16] <= 0.001944) {
                  return 0.002005;
                } else {
                  return 0.029731;
                }
              } else {
                if (f[9] <= 0.000367) {
                  return -0.034727;
                } else {
                  return 0.008554;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.038887;
          } else {
            if (f[3] <= 0.001457) {
              if (f[8] <= -0.001349) {
                return -0.045302;
              } else {
                return -0.010995;
              }
            } else {
              return 0.025359;
            }
          }
        } else {
          if (f[10] <= -0.000070) {
            return 0.020746;
          } else {
            if (f[15] <= -0.000284) {
              if (f[3] <= 0.001468) {
                if (f[3] <= 0.001456) {
                  return -0.010768;
                } else {
                  return 0.023530;
                }
              } else {
                return -0.041145;
              }
            } else {
              if (f[12] <= 0.000055) {
                return -0.009228;
              } else {
                if (f[2] <= 0.140496) {
                  return -0.031991;
                } else {
                  return -0.055307;
                }
              }
            }
          }
        }
      } else {
        if (f[16] <= 0.001019) {
          if (f[6] <= -0.000212) {
            return 0.027532;
          } else {
            if (f[1] <= -1.297390) {
              if (f[1] <= -3.005791) {
                if (f[3] <= 0.001388) {
                  return 0.020559;
                } else {
                  return -0.014605;
                }
              } else {
                if (f[0] <= 24.371271) {
                  return -0.024050;
                } else {
                  return 0.002247;
                }
              }
            } else {
              if (f[1] <= 1.878951) {
                if (f[0] <= 54.525383) {
                  return 0.008365;
                } else {
                  return 0.022514;
                }
              } else {
                if (f[3] <= 0.003372) {
                  return -0.005474;
                } else {
                  return 0.018732;
                }
              }
            }
          }
        } else {
          if (f[0] <= 73.942971) {
            if (f[14] <= -0.000180) {
              return 0.004806;
            } else {
              if (f[1] <= 1.956809) {
                return -0.004537;
              } else {
                if (f[1] <= 6.167025) {
                  return -0.055841;
                } else {
                  return -0.038095;
                }
              }
            }
          } else {
            if (f[16] <= 0.002373) {
              if (f[16] <= 0.001944) {
                if (f[15] <= 0.001139) {
                  return 0.009380;
                } else {
                  return -0.029201;
                }
              } else {
                if (f[8] <= 0.001544) {
                  return 0.042488;
                } else {
                  return 0.016313;
                }
              }
            } else {
              if (f[3] <= 0.006160) {
                if (f[6] <= 0.000868) {
                  return -0.025201;
                } else {
                  return -0.044817;
                }
              } else {
                return 0.001955;
              }
            }
          }
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.037789;
          } else {
            if (f[3] <= 0.001457) {
              if (f[2] <= 0.097240) {
                return -0.010516;
              } else {
                return -0.044177;
              }
            } else {
              return 0.024623;
            }
          }
        } else {
          if (f[10] <= -0.000070) {
            return 0.020133;
          } else {
            if (f[3] <= 0.001468) {
              if (f[3] <= 0.001456) {
                if (f[3] <= 0.001401) {
                  return -0.006730;
                } else {
                  return -0.022713;
                }
              } else {
                return 0.024005;
              }
            } else {
              return -0.039982;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[8] <= 0.000544) {
                if (f[6] <= -0.000212) {
                  return 0.026735;
                } else {
                  return 0.004623;
                }
              } else {
                if (f[6] <= -0.000178) {
                  return 0.016107;
                } else {
                  return -0.023140;
                }
              }
            } else {
              return 0.036784;
            }
          } else {
            if (f[4] <= 0.000000) {
              return 0.037449;
            } else {
              if (f[8] <= 0.000754) {
                return 0.024206;
              } else {
                return -0.014162;
              }
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[0] <= 66.976498) {
                  return 0.003686;
                } else {
                  return -0.030993;
                }
              } else {
                return 0.027271;
              }
            } else {
              return -0.054455;
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[6] <= -0.000065) {
                return 0.036859;
              } else {
                if (f[7] <= 0.001472) {
                  return 0.000793;
                } else {
                  return 0.023730;
                }
              }
            } else {
              if (f[9] <= 0.000367) {
                if (f[14] <= -0.000000) {
                  return -0.055400;
                } else {
                  return -0.005768;
                }
              } else {
                return 0.002354;
              }
            }
          }
        }
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.038319;
          } else {
            if (f[3] <= 0.001434) {
              return -0.029164;
            } else {
              return 0.009162;
            }
          }
        } else {
          if (f[15] <= -0.000284) {
            if (f[3] <= 0.001344) {
              if (f[20] <= 0.000000) {
                if (f[15] <= -0.000291) {
                  return -0.019651;
                } else {
                  return 0.027343;
                }
              } else {
                return 0.029255;
              }
            } else {
              if (f[8] <= -0.000719) {
                if (f[3] <= 0.001385) {
                  return -0.034130;
                } else {
                  return -0.007941;
                }
              } else {
                return -0.054754;
              }
            }
          } else {
            if (f[12] <= 0.000058) {
              return -0.013823;
            } else {
              return -0.054658;
            }
          }
        }
      } else {
        if (f[0] <= 67.510927) {
          if (f[1] <= -0.637435) {
            if (f[0] <= 47.278078) {
              if (f[0] <= 38.821267) {
                if (f[6] <= -0.000207) {
                  return 0.016972;
                } else {
                  return -0.005587;
                }
              } else {
                return 0.032448;
              }
            } else {
              if (f[15] <= 0.000714) {
                return -0.050936;
              } else {
                return -0.003729;
              }
            }
          } else {
            if (f[8] <= 0.000544) {
              if (f[0] <= 54.525383) {
                if (f[0] <= 45.990153) {
                  return 0.015973;
                } else {
                  return -0.024510;
                }
              } else {
                if (f[8] <= -0.000307) {
                  return -0.005067;
                } else {
                  return 0.029889;
                }
              }
            } else {
              if (f[3] <= 0.003605) {
                if (f[0] <= 64.352753) {
                  return -0.014303;
                } else {
                  return 0.021938;
                }
              } else {
                return 0.031688;
              }
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[14] <= -0.000180) {
              return 0.003964;
            } else {
              if (f[1] <= 1.827821) {
                return -0.005242;
              } else {
                return -0.045584;
              }
            }
          } else {
            if (f[3] <= 0.004801) {
              if (f[15] <= -0.000290) {
                return 0.026489;
              } else {
                if (f[8] <= 0.001159) {
                  return -0.025024;
                } else {
                  return 0.012000;
                }
              }
            } else {
              if (f[12] <= 0.000068) {
                return -0.022235;
              } else {
                return 0.018159;
              }
            }
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[1] <= -5.388620) {
              if (f[9] <= 0.000059) {
                if (f[6] <= -0.000207) {
                  return 0.048380;
                } else {
                  return 0.021996;
                }
              } else {
                if (f[7] <= -0.000593) {
                  return 0.004479;
                } else {
                  return -0.034624;
                }
              }
            } else {
              if (f[1] <= -4.550359) {
                if (f[16] <= -0.000610) {
                  return 0.004136;
                } else {
                  return -0.023788;
                }
              } else {
                if (f[1] <= -2.871715) {
                  return 0.002517;
                } else {
                  return -0.012043;
                }
              }
            }
          } else {
            return 0.033479;
          }
        } else {
          if (f[14] <= 0.000838) {
            return -0.055565;
          } else {
            return -0.007330;
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[9] <= 0.000167) {
            if (f[9] <= 0.000148) {
              if (f[6] <= -0.000195) {
                return 0.028476;
              } else {
                if (f[9] <= 0.000097) {
                  return -0.003682;
                } else {
                  return 0.014017;
                }
              }
            } else {
              return 0.039020;
            }
          } else {
            if (f[14] <= 0.001471) {
              return -0.027929;
            } else {
              return 0.015941;
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[7] <= 0.000664) {
              if (f[9] <= 0.000138) {
                return -0.000604;
              } else {
                if (f[0] <= 66.309351) {
                  return 0.052429;
                } else {
                  return 0.015601;
                }
              }
            } else {
              return -0.011667;
            }
          } else {
            if (f[1] <= 5.256275) {
              if (f[16] <= -0.000597) {
                return 0.029257;
              } else {
                if (f[16] <= 0.001800) {
                  return -0.025733;
                } else {
                  return 0.029946;
                }
              }
            } else {
              if (f[16] <= 0.002373) {
                if (f[16] <= -0.000404) {
                  return -0.023382;
                } else {
                  return 0.010546;
                }
              } else {
                if (f[16] <= 0.003716) {
                  return -0.040191;
                } else {
                  return -0.002181;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.036535;
          } else {
            if (f[3] <= 0.001434) {
              if (f[8] <= -0.001212) {
                if (f[16] <= -0.000589) {
                  return -0.054394;
                } else {
                  return -0.007058;
                }
              } else {
                return -0.011187;
              }
            } else {
              if (f[12] <= 0.000063) {
                return 0.016310;
              } else {
                return -0.021175;
              }
            }
          }
        } else {
          if (f[2] <= 0.199219) {
            if (f[1] <= -4.213230) {
              if (f[16] <= -0.000610) {
                if (f[8] <= -0.000952) {
                  return 0.013070;
                } else {
                  return -0.042373;
                }
              } else {
                if (f[2] <= 0.090838) {
                  return -0.050511;
                } else {
                  return -0.017000;
                }
              }
            } else {
              if (f[3] <= 0.001424) {
                if (f[3] <= 0.001079) {
                  return -0.006805;
                } else {
                  return 0.016993;
                }
              } else {
                return -0.043892;
              }
            }
          } else {
            if (f[14] <= -0.000172) {
              return -0.053722;
            } else {
              return -0.008238;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[1] <= 3.176611) {
                if (f[6] <= -0.000212) {
                  return 0.025558;
                } else {
                  return 0.003620;
                }
              } else {
                if (f[16] <= 0.000385) {
                  return -0.042459;
                } else {
                  return 0.001455;
                }
              }
            } else {
              return 0.035113;
            }
          } else {
            if (f[1] <= 2.523875) {
              return 0.034998;
            } else {
              return -0.007904;
            }
          }
        } else {
          if (f[9] <= 0.000182) {
            if (f[1] <= 5.847266) {
              if (f[3] <= 0.002201) {
                if (f[9] <= 0.000174) {
                  return -0.038155;
                } else {
                  return -0.007970;
                }
              } else {
                return -0.053509;
              }
            } else {
              return 0.018997;
            }
          } else {
            if (f[3] <= 0.002027) {
              return -0.045063;
            } else {
              if (f[9] <= 0.000321) {
                if (f[16] <= 0.001944) {
                  return 0.002669;
                } else {
                  return 0.021667;
                }
              } else {
                if (f[9] <= 0.000367) {
                  return -0.031496;
                } else {
                  return 0.002842;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001167) {
          if (f[3] <= 0.001399) {
            if (f[8] <= -0.001258) {
              return 0.034207;
            } else {
              if (f[13] <= -0.000061) {
                return 0.007094;
              } else {
                return -0.043115;
              }
            }
          } else {
            if (f[3] <= 0.001434) {
              return -0.026673;
            } else {
              if (f[7] <= -0.000610) {
                return -0.010762;
              } else {
                if (f[2] <= 0.098051) {
                  return 0.041107;
                } else {
                  return 0.008816;
                }
              }
            }
          }
        } else {
          if (f[8] <= -0.001038) {
            if (f[3] <= 0.001456) {
              if (f[8] <= -0.001123) {
                if (f[6] <= -0.000205) {
                  return 0.002548;
                } else {
                  return -0.039477;
                }
              } else {
                return -0.048630;
              }
            } else {
              return 0.023514;
            }
          } else {
            if (f[15] <= -0.000314) {
              return -0.048781;
            } else {
              if (f[2] <= 0.199219) {
                if (f[3] <= 0.001344) {
                  return 0.015164;
                } else {
                  return -0.010152;
                }
              } else {
                if (f[14] <= -0.000172) {
                  return -0.052150;
                } else {
                  return -0.003825;
                }
              }
            }
          }
        }
      } else {
        if (f[16] <= 0.001019) {
          if (f[6] <= -0.000212) {
            return 0.024838;
          } else {
            if (f[7] <= -0.000289) {
              if (f[14] <= -0.000164) {
                if (f[6] <= -0.000207) {
                  return 0.007870;
                } else {
                  return -0.019107;
                }
              } else {
                return 0.030622;
              }
            } else {
              if (f[6] <= -0.000195) {
                return 0.028548;
              } else {
                if (f[8] <= 0.000261) {
                  return 0.010359;
                } else {
                  return 0.000919;
                }
              }
            }
          }
        } else {
          if (f[0] <= 73.942971) {
            if (f[14] <= -0.000180) {
              return 0.004772;
            } else {
              if (f[14] <= 0.001471) {
                return -0.048189;
              } else {
                return -0.010753;
              }
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[16] <= 0.001944) {
                if (f[15] <= 0.001139) {
                  return 0.012101;
                } else {
                  return -0.028661;
                }
              } else {
                return 0.020182;
              }
            } else {
              if (f[9] <= 0.000367) {
                return -0.045326;
              } else {
                return 0.005728;
              }
            }
          }
        }
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.035255;
          } else {
            if (f[3] <= 0.001457) {
              if (f[8] <= -0.001349) {
                return -0.042817;
              } else {
                return -0.009401;
              }
            } else {
              return 0.023388;
            }
          }
        } else {
          if (f[13] <= -0.000070) {
            return 0.019701;
          } else {
            if (f[3] <= 0.001468) {
              if (f[3] <= 0.001456) {
                if (f[3] <= 0.001401) {
                  return -0.005836;
                } else {
                  return -0.020621;
                }
              } else {
                return 0.023614;
              }
            } else {
              return -0.038054;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[1] <= 3.176611) {
                if (f[6] <= -0.000212) {
                  return 0.024145;
                } else {
                  return 0.003616;
                }
              } else {
                if (f[16] <= 0.000385) {
                  return -0.041326;
                } else {
                  return -0.001000;
                }
              }
            } else {
              return 0.034162;
            }
          } else {
            if (f[1] <= 2.523875) {
              if (f[1] <= 1.365350) {
                return 0.038483;
              } else {
                return 0.030011;
              }
            } else {
              return -0.005075;
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[0] <= 66.976498) {
                  return 0.003796;
                } else {
                  return -0.028468;
                }
              } else {
                return 0.026386;
              }
            } else {
              return -0.051723;
            }
          } else {
            if (f[16] <= 0.002373) {
              if (f[16] <= 0.001944) {
                if (f[6] <= -0.000065) {
                  return 0.033787;
                } else {
                  return -0.003032;
                }
              } else {
                if (f[8] <= 0.001544) {
                  return 0.039535;
                } else {
                  return 0.014104;
                }
              }
            } else {
              if (f[3] <= 0.006160) {
                if (f[6] <= 0.000868) {
                  return -0.023348;
                } else {
                  return -0.042391;
                }
              } else {
                return 0.003514;
              }
            }
          }
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001167) {
          if (f[9] <= 0.000059) {
            if (f[8] <= -0.001266) {
              return 0.030708;
            } else {
              return -0.020330;
            }
          } else {
            if (f[9] <= 0.000060) {
              if (f[16] <= -0.000594) {
                return -0.054013;
              } else {
                return 0.002533;
              }
            } else {
              if (f[8] <= -0.001266) {
                if (f[2] <= 0.102972) {
                  return -0.022903;
                } else {
                  return 0.022689;
                }
              } else {
                if (f[14] <= -0.000193) {
                  return 0.049597;
                } else {
                  return 0.008324;
                }
              }
            }
          }
        } else {
          if (f[8] <= -0.001038) {
            if (f[14] <= -0.000182) {
              if (f[9] <= 0.000061) {
                return -0.029243;
              } else {
                return 0.009530;
              }
            } else {
              if (f[8] <= -0.001130) {
                return -0.016926;
              } else {
                return -0.053990;
              }
            }
          } else {
            if (f[15] <= -0.000314) {
              return -0.047224;
            } else {
              if (f[2] <= 0.199219) {
                if (f[8] <= -0.000719) {
                  return 0.002737;
                } else {
                  return -0.023430;
                }
              } else {
                if (f[14] <= -0.000172) {
                  return -0.050812;
                } else {
                  return -0.003560;
                }
              }
            }
          }
        }
      } else {
        if (f[16] <= 0.001019) {
          if (f[6] <= -0.000212) {
            return 0.023477;
          } else {
            if (f[7] <= -0.000289) {
              if (f[14] <= -0.000164) {
                if (f[6] <= -0.000207) {
                  return 0.007529;
                } else {
                  return -0.018643;
                }
              } else {
                return 0.029626;
              }
            } else {
              if (f[6] <= -0.000195) {
                return 0.027630;
              } else {
                if (f[8] <= 0.000261) {
                  return 0.009894;
                } else {
                  return 0.000795;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000183) {
            if (f[12] <= 0.000062) {
              return -0.045389;
            } else {
              return -0.002459;
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[16] <= 0.001944) {
                if (f[7] <= 0.000839) {
                  return 0.004948;
                } else {
                  return -0.028049;
                }
              } else {
                return 0.019222;
              }
            } else {
              if (f[9] <= 0.000367) {
                return -0.043900;
              } else {
                return 0.005849;
              }
            }
          }
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[8] <= -0.000378) {
        if (f[3] <= 0.001401) {
          if (f[8] <= -0.001258) {
            return 0.030529;
          } else {
            if (f[7] <= -0.000552) {
              if (f[3] <= 0.001394) {
                return -0.050666;
              } else {
                return 0.004927;
              }
            } else {
              if (f[6] <= -0.000202) {
                if (f[16] <= -0.000587) {
                  return 0.021848;
                } else {
                  return -0.022723;
                }
              } else {
                if (f[8] <= -0.001054) {
                  return -0.053324;
                } else {
                  return -0.001233;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[16] <= -0.000578) {
              return -0.035052;
            } else {
              return 0.012059;
            }
          } else {
            if (f[7] <= -0.000432) {
              if (f[16] <= -0.000620) {
                if (f[15] <= -0.000322) {
                  return 0.010295;
                } else {
                  return -0.029307;
                }
              } else {
                if (f[3] <= 0.001457) {
                  return -0.000820;
                } else {
                  return 0.020286;
                }
              }
            } else {
              return -0.038542;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[9] <= 0.000120) {
            if (f[0] <= 47.278078) {
              if (f[9] <= 0.000102) {
                if (f[3] <= 0.001403) {
                  return -0.000634;
                } else {
                  return 0.014048;
                }
              } else {
                return 0.048758;
              }
            } else {
              return -0.045553;
            }
          } else {
            if (f[5] <= 0.000000) {
              if (f[9] <= 0.000167) {
                return 0.032218;
              } else {
                return 0.002536;
              }
            } else {
              if (f[3] <= 0.001333) {
                return 0.018631;
              } else {
                return -0.046180;
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              return 0.020248;
            } else {
              return -0.011396;
            }
          } else {
            if (f[3] <= 0.002728) {
              if (f[15] <= 0.000556) {
                if (f[16] <= -0.000585) {
                  return 0.013730;
                } else {
                  return -0.040874;
                }
              } else {
                if (f[15] <= 0.000714) {
                  return 0.026390;
                } else {
                  return -0.013464;
                }
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[16] <= -0.000404) {
                  return -0.014466;
                } else {
                  return 0.009907;
                }
              } else {
                return -0.042052;
              }
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.033741;
          } else {
            if (f[3] <= 0.001434) {
              return -0.025582;
            } else {
              if (f[12] <= 0.000063) {
                return 0.015779;
              } else {
                return -0.020138;
              }
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            if (f[7] <= -0.000395) {
              if (f[6] <= -0.000208) {
                if (f[8] <= -0.001160) {
                  return 0.019125;
                } else {
                  return -0.016728;
                }
              } else {
                return 0.019616;
              }
            } else {
              return -0.041148;
            }
          } else {
            if (f[8] <= -0.001038) {
              if (f[16] <= -0.000591) {
                return -0.054059;
              } else {
                if (f[6] <= -0.000204) {
                  return 0.019872;
                } else {
                  return -0.038294;
                }
              }
            } else {
              if (f[3] <= 0.001341) {
                if (f[9] <= 0.000064) {
                  return 0.031557;
                } else {
                  return -0.012868;
                }
              } else {
                if (f[8] <= -0.000785) {
                  return -0.007630;
                } else {
                  return -0.052403;
                }
              }
            }
          }
        }
      } else {
        if (f[16] <= 0.001019) {
          if (f[6] <= -0.000212) {
            return 0.022792;
          } else {
            if (f[1] <= -0.637435) {
              if (f[9] <= 0.000129) {
                if (f[6] <= -0.000162) {
                  return -0.007217;
                } else {
                  return 0.014763;
                }
              } else {
                return -0.043184;
              }
            } else {
              if (f[1] <= 1.878951) {
                if (f[2] <= 0.069312) {
                  return -0.057316;
                } else {
                  return 0.014856;
                }
              } else {
                if (f[3] <= 0.001660) {
                  return -0.017943;
                } else {
                  return 0.007087;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000207) {
            if (f[14] <= -0.000180) {
              return 0.003062;
            } else {
              if (f[1] <= 1.827821) {
                return 0.000000;
              } else {
                return -0.045487;
              }
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[16] <= 0.001944) {
                if (f[7] <= 0.000839) {
                  return 0.011855;
                } else {
                  return -0.022026;
                }
              } else {
                return 0.018534;
              }
            } else {
              if (f[9] <= 0.000367) {
                return -0.042626;
              } else {
                return 0.006093;
              }
            }
          }
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[8] <= -0.000378) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.032724;
          } else {
            if (f[3] <= 0.001457) {
              return -0.024245;
            } else {
              return 0.022011;
            }
          }
        } else {
          if (f[3] <= 0.001401) {
            if (f[8] <= -0.001258) {
              return 0.026220;
            } else {
              if (f[1] <= -4.993928) {
                if (f[3] <= 0.001394) {
                  return -0.044583;
                } else {
                  return 0.000000;
                }
              } else {
                if (f[6] <= -0.000202) {
                  return 0.012719;
                } else {
                  return -0.004735;
                }
              }
            }
          } else {
            if (f[3] <= 0.001415) {
              if (f[16] <= -0.000581) {
                return -0.049459;
              } else {
                return -0.006557;
              }
            } else {
              if (f[6] <= -0.000204) {
                if (f[3] <= 0.001468) {
                  return 0.001901;
                } else {
                  return -0.025882;
                }
              } else {
                return -0.033075;
              }
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[9] <= 0.000120) {
            if (f[9] <= 0.000113) {
              if (f[15] <= -0.000296) {
                if (f[15] <= -0.000305) {
                  return 0.002458;
                } else {
                  return 0.022340;
                }
              } else {
                if (f[5] <= 0.000000) {
                  return -0.011879;
                } else {
                  return 0.021469;
                }
              }
            } else {
              return -0.039731;
            }
          } else {
            if (f[5] <= 0.000000) {
              if (f[9] <= 0.000167) {
                return 0.030977;
              } else {
                return 0.002277;
              }
            } else {
              if (f[3] <= 0.001333) {
                return 0.018394;
              } else {
                return -0.044211;
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              return 0.019562;
            } else {
              return -0.011028;
            }
          } else {
            if (f[3] <= 0.002728) {
              if (f[15] <= 0.000556) {
                if (f[16] <= -0.000585) {
                  return 0.013306;
                } else {
                  return -0.039583;
                }
              } else {
                if (f[15] <= 0.000714) {
                  return 0.025797;
                } else {
                  return -0.012756;
                }
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[14] <= -0.000169) {
                  return -0.004431;
                } else {
                  return 0.016398;
                }
              } else {
                return -0.040633;
              }
            }
          }
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[9] <= 0.000059) {
            return 0.037971;
          } else {
            if (f[7] <= -0.000588) {
              if (f[2] <= 0.095127) {
                if (f[9] <= 0.000062) {
                  return -0.030516;
                } else {
                  return 0.010808;
                }
              } else {
                if (f[20] <= 0.000000) {
                  return 0.002170;
                } else {
                  return 0.035637;
                }
              }
            } else {
              return -0.030067;
            }
          }
        } else {
          if (f[15] <= -0.000284) {
            if (f[1] <= -5.256701) {
              if (f[2] <= 0.103183) {
                return -0.034884;
              } else {
                return 0.019954;
              }
            } else {
              if (f[8] <= -0.000719) {
                if (f[9] <= 0.000059) {
                  return 0.013233;
                } else {
                  return -0.005768;
                }
              } else {
                if (f[2] <= 0.096895) {
                  return -0.000012;
                } else {
                  return -0.043105;
                }
              }
            }
          } else {
            if (f[12] <= 0.000055) {
              return -0.001370;
            } else {
              return -0.041644;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[15] <= 0.000787) {
              if (f[15] <= 0.000616) {
                if (f[0] <= 47.278078) {
                  return 0.006504;
                } else {
                  return -0.007768;
                }
              } else {
                return 0.027669;
              }
            } else {
              return -0.024305;
            }
          } else {
            if (f[1] <= 2.523875) {
              return 0.032595;
            } else {
              return -0.004206;
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[9] <= 0.000182) {
                if (f[1] <= 5.847266) {
                  return -0.030736;
                } else {
                  return 0.018341;
                }
              } else {
                if (f[2] <= 0.679461) {
                  return 0.033670;
                } else {
                  return -0.001803;
                }
              }
            } else {
              return -0.049891;
            }
          } else {
            if (f[16] <= 0.002373) {
              if (f[15] <= 0.002105) {
                if (f[7] <= 0.000479) {
                  return 0.025188;
                } else {
                  return -0.001381;
                }
              } else {
                return 0.036175;
              }
            } else {
              if (f[9] <= 0.000367) {
                if (f[15] <= 0.000255) {
                  return -0.000737;
                } else {
                  return -0.051429;
                }
              } else {
                return 0.009776;
              }
            }
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[7] <= -0.000231) {
        if (f[0] <= 46.669689) {
          if (f[0] <= 41.415253) {
            if (f[16] <= -0.000235) {
              if (f[10] <= -0.000070) {
                return 0.017399;
              } else {
                if (f[10] <= -0.000068) {
                  return -0.040455;
                } else {
                  return -0.002373;
                }
              }
            } else {
              return -0.032211;
            }
          } else {
            return 0.033437;
          }
        } else {
          return -0.050886;
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[15] <= 0.000787) {
                if (f[3] <= 0.001364) {
                  return 0.010008;
                } else {
                  return -0.003714;
                }
              } else {
                if (f[9] <= 0.000141) {
                  return -0.043122;
                } else {
                  return -0.003489;
                }
              }
            } else {
              return 0.032505;
            }
          } else {
            if (f[15] <= -0.000300) {
              return 0.038213;
            } else {
              if (f[3] <= 0.001292) {
                return 0.047223;
              } else {
                if (f[15] <= 0.000982) {
                  return -0.024591;
                } else {
                  return 0.021530;
                }
              }
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[20] <= 0.000000) {
                  return -0.001894;
                } else {
                  return -0.041072;
                }
              } else {
                return 0.024849;
              }
            } else {
              return -0.048904;
            }
          } else {
            if (f[16] <= 0.002373) {
              if (f[15] <= 0.002105) {
                if (f[7] <= 0.000479) {
                  return 0.024485;
                } else {
                  return -0.001340;
                }
              } else {
                return 0.035287;
              }
            } else {
              if (f[3] <= 0.006160) {
                if (f[15] <= 0.001838) {
                  return -0.021975;
                } else {
                  return -0.039022;
                }
              } else {
                return 0.004108;
              }
            }
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[8] <= -0.000378) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.031924;
          } else {
            if (f[3] <= 0.001457) {
              if (f[8] <= -0.001349) {
                return -0.040157;
              } else {
                return -0.007017;
              }
            } else {
              return 0.021413;
            }
          }
        } else {
          if (f[0] <= 47.278078) {
            if (f[0] <= 38.821267) {
              if (f[1] <= -2.871715) {
                if (f[1] <= -4.213230) {
                  return -0.009932;
                } else {
                  return 0.005580;
                }
              } else {
                if (f[9] <= 0.000061) {
                  return -0.016947;
                } else {
                  return -0.057054;
                }
              }
            } else {
              return 0.023526;
            }
          } else {
            if (f[16] <= 0.000398) {
              return -0.046163;
            } else {
              return 0.000137;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[9] <= 0.000120) {
            if (f[0] <= 47.278078) {
              if (f[9] <= 0.000102) {
                if (f[15] <= -0.000296) {
                  return 0.010253;
                } else {
                  return -0.003870;
                }
              } else {
                return 0.046410;
              }
            } else {
              return -0.043589;
            }
          } else {
            if (f[5] <= 0.000000) {
              if (f[3] <= 0.001347) {
                return 0.037661;
              } else {
                if (f[8] <= -0.000061) {
                  return 0.027754;
                } else {
                  return 0.007972;
                }
              }
            } else {
              if (f[3] <= 0.001333) {
                return 0.016786;
              } else {
                return -0.042604;
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.004595;
              } else {
                if (f[16] <= 0.000385) {
                  return 0.007436;
                } else {
                  return 0.037366;
                }
              }
            } else {
              if (f[3] <= 0.005687) {
                return -0.034187;
              } else {
                return 0.010089;
              }
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.037811;
                } else {
                  return 0.026070;
                }
              } else {
                return -0.053596;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[1] <= 5.256275) {
                  return -0.011576;
                } else {
                  return 0.006440;
                }
              } else {
                return -0.038484;
              }
            }
          }
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[1] <= -5.388620) {
          if (f[3] <= 0.001399) {
            return 0.032010;
          } else {
            if (f[3] <= 0.001434) {
              if (f[8] <= -0.001212) {
                if (f[15] <= -0.000289) {
                  return -0.049684;
                } else {
                  return -0.005669;
                }
              } else {
                return -0.007333;
              }
            } else {
              if (f[7] <= -0.000610) {
                return -0.010827;
              } else {
                return 0.018418;
              }
            }
          }
        } else {
          if (f[15] <= -0.000284) {
            if (f[3] <= 0.001344) {
              if (f[20] <= 0.000000) {
                if (f[15] <= -0.000291) {
                  return -0.017130;
                } else {
                  return 0.027059;
                }
              } else {
                return 0.029030;
              }
            } else {
              if (f[8] <= -0.000719) {
                if (f[3] <= 0.001385) {
                  return -0.030425;
                } else {
                  return -0.005067;
                }
              } else {
                return -0.049072;
              }
            }
          } else {
            if (f[12] <= 0.000055) {
              return -0.001093;
            } else {
              return -0.040564;
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[8] <= 0.000544) {
                if (f[1] <= -0.637435) {
                  return 0.000631;
                } else {
                  return 0.010239;
                }
              } else {
                if (f[6] <= -0.000178) {
                  return 0.014659;
                } else {
                  return -0.020601;
                }
              }
            } else {
              return 0.031650;
            }
          } else {
            if (f[1] <= 2.523875) {
              return 0.030123;
            } else {
              return -0.006603;
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[0] <= 66.976498) {
                  return 0.005446;
                } else {
                  return -0.025905;
                }
              } else {
                return 0.024165;
              }
            } else {
              return -0.047856;
            }
          } else {
            if (f[9] <= 0.000321) {
              if (f[6] <= -0.000065) {
                return 0.033086;
              } else {
                if (f[8] <= 0.001986) {
                  return -0.000383;
                } else {
                  return 0.021831;
                }
              }
            } else {
              if (f[15] <= 0.000062) {
                return -0.040862;
              } else {
                if (f[15] <= 0.001838) {
                  return 0.017296;
                } else {
                  return -0.025070;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[9] <= 0.000109) {
          if (f[14] <= -0.000165) {
            if (f[14] <= -0.000170) {
              if (f[1] <= -5.388620) {
                if (f[9] <= 0.000059) {
                  return 0.033287;
                } else {
                  return -0.003615;
                }
              } else {
                if (f[9] <= 0.000060) {
                  return -0.012876;
                } else {
                  return 0.000310;
                }
              }
            } else {
              if (f[3] <= 0.001384) {
                return -0.010985;
              } else {
                return -0.038100;
              }
            }
          } else {
            if (f[2] <= 0.105660) {
              return 0.038553;
            } else {
              if (f[1] <= -3.639948) {
                if (f[10] <= -0.000047) {
                  return -0.037899;
                } else {
                  return 0.007686;
                }
              } else {
                if (f[9] <= 0.000073) {
                  return 0.037258;
                } else {
                  return -0.000318;
                }
              }
            }
          }
        } else {
          if (f[14] <= 0.000838) {
            return -0.050932;
          } else {
            return -0.006161;
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[19] <= 0.000000) {
            if (f[9] <= 0.000097) {
              return 0.003996;
            } else {
              if (f[3] <= 0.001283) {
                return 0.035008;
              } else {
                if (f[1] <= 0.000000) {
                  return -0.032071;
                } else {
                  return 0.013996;
                }
              }
            }
          } else {
            if (f[9] <= 0.000120) {
              if (f[16] <= 0.000146) {
                return 0.009243;
              } else {
                return -0.055849;
              }
            } else {
              return 0.021609;
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[7] <= 0.000664) {
              if (f[3] <= 0.003956) {
                if (f[3] <= 0.001841) {
                  return 0.025977;
                } else {
                  return -0.007174;
                }
              } else {
                return 0.037306;
              }
            } else {
              return -0.011326;
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.036782;
                } else {
                  return 0.025529;
                }
              } else {
                return -0.051931;
              }
            } else {
              if (f[16] <= 0.002373) {
                if (f[1] <= 5.256275) {
                  return -0.010894;
                } else {
                  return 0.008348;
                }
              } else {
                if (f[16] <= 0.003716) {
                  return -0.036581;
                } else {
                  return 0.000393;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[8] <= -0.000378) {
        if (f[8] <= -0.001318) {
          if (f[3] <= 0.001406) {
            return 0.030666;
          } else {
            if (f[3] <= 0.001457) {
              if (f[8] <= -0.001349) {
                return -0.038875;
              } else {
                return -0.006366;
              }
            } else {
              return 0.021028;
            }
          }
        } else {
          if (f[0] <= 47.278078) {
            if (f[0] <= 38.821267) {
              if (f[1] <= -2.871715) {
                if (f[1] <= -4.213230) {
                  return -0.009374;
                } else {
                  return 0.005567;
                }
              } else {
                if (f[9] <= 0.000061) {
                  return -0.016190;
                } else {
                  return -0.055482;
                }
              }
            } else {
              return 0.022756;
            }
          } else {
            if (f[1] <= -0.981681) {
              return -0.050174;
            } else {
              return -0.004841;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[9] <= 0.000120) {
            if (f[0] <= 47.278078) {
              if (f[9] <= 0.000102) {
                if (f[3] <= 0.001403) {
                  return -0.001496;
                } else {
                  return 0.012696;
                }
              } else {
                return 0.044656;
              }
            } else {
              return -0.041710;
            }
          } else {
            if (f[5] <= 0.000000) {
              if (f[3] <= 0.001347) {
                return 0.035804;
              } else {
                if (f[7] <= -0.000115) {
                  return 0.043359;
                } else {
                  return 0.010749;
                }
              }
            } else {
              if (f[3] <= 0.001333) {
                return 0.015852;
              } else {
                return -0.041079;
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.005052;
              } else {
                if (f[2] <= 0.591259) {
                  return 0.007897;
                } else {
                  return 0.032175;
                }
              }
            } else {
              if (f[3] <= 0.005687) {
                return -0.033549;
              } else {
                return 0.009968;
              }
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.035787;
                } else {
                  return 0.024794;
                }
              } else {
                return -0.050791;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[1] <= 5.256275) {
                  return -0.010779;
                } else {
                  return 0.006077;
                }
              } else {
                return -0.037014;
              }
            }
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[8] <= -0.000329) {
        if (f[3] <= 0.001401) {
          if (f[1] <= -5.388620) {
            return 0.029084;
          } else {
            if (f[7] <= -0.000552) {
              if (f[2] <= 0.097866) {
                return -0.046259;
              } else {
                return -0.004246;
              }
            } else {
              if (f[9] <= 0.000059) {
                if (f[16] <= -0.000586) {
                  return 0.038768;
                } else {
                  return -0.006803;
                }
              } else {
                if (f[6] <= -0.000202) {
                  return 0.012978;
                } else {
                  return -0.007142;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[16] <= -0.000578) {
              return -0.032771;
            } else {
              return 0.011279;
            }
          } else {
            if (f[7] <= -0.000529) {
              if (f[3] <= 0.001434) {
                if (f[9] <= 0.000061) {
                  return -0.000873;
                } else {
                  return -0.040478;
                }
              } else {
                if (f[7] <= -0.000610) {
                  return -0.010500;
                } else {
                  return 0.016831;
                }
              }
            } else {
              if (f[9] <= 0.000061) {
                return 0.008346;
              } else {
                if (f[8] <= -0.000553) {
                  return -0.052668;
                } else {
                  return -0.006822;
                }
              }
            }
          }
        }
      } else {
        if (f[15] <= -0.000296) {
          if (f[8] <= 0.001366) {
            if (f[3] <= 0.003956) {
              if (f[8] <= 0.000884) {
                return 0.011986;
              } else {
                return -0.019765;
              }
            } else {
              return 0.032258;
            }
          } else {
            if (f[3] <= 0.004970) {
              return -0.046394;
            } else {
              return 0.000000;
            }
          }
        } else {
          if (f[2] <= 0.193154) {
            if (f[16] <= -0.000580) {
              return -0.008505;
            } else {
              return -0.058201;
            }
          } else {
            if (f[1] <= 1.878951) {
              if (f[0] <= 54.525383) {
                if (f[1] <= -0.454933) {
                  return 0.018950;
                } else {
                  return -0.016235;
                }
              } else {
                if (f[15] <= 0.000729) {
                  return 0.036102;
                } else {
                  return -0.001004;
                }
              }
            } else {
              if (f[1] <= 5.017849) {
                if (f[15] <= 0.000574) {
                  return -0.033424;
                } else {
                  return -0.003346;
                }
              } else {
                if (f[16] <= 0.001019) {
                  return 0.018908;
                } else {
                  return -0.008412;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[8] <= -0.001154) {
          if (f[15] <= -0.000314) {
            return 0.021987;
          } else {
            if (f[9] <= 0.000062) {
              if (f[2] <= 0.094779) {
                if (f[7] <= -0.000585) {
                  return -0.004158;
                } else {
                  return -0.051401;
                }
              } else {
                if (f[3] <= 0.001399) {
                  return 0.023083;
                } else {
                  return 0.000718;
                }
              }
            } else {
              return -0.038012;
            }
          }
        } else {
          if (f[8] <= -0.001062) {
            if (f[9] <= 0.000060) {
              return -0.049674;
            } else {
              if (f[6] <= -0.000204) {
                return 0.001691;
              } else {
                return -0.050201;
              }
            }
          } else {
            if (f[15] <= -0.000314) {
              return -0.044755;
            } else {
              if (f[2] <= 0.199219) {
                if (f[3] <= 0.001344) {
                  return 0.013771;
                } else {
                  return -0.007384;
                }
              } else {
                if (f[0] <= 46.349810) {
                  return -0.048875;
                } else {
                  return -0.005210;
                }
              }
            }
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[8] <= 0.000544) {
                if (f[6] <= -0.000212) {
                  return 0.021693;
                } else {
                  return 0.002682;
                }
              } else {
                if (f[16] <= -0.000597) {
                  return 0.022792;
                } else {
                  return -0.023553;
                }
              }
            } else {
              return 0.030323;
            }
          } else {
            if (f[15] <= -0.000300) {
              return 0.035620;
            } else {
              if (f[3] <= 0.001564) {
                return 0.027843;
              } else {
                return -0.008746;
              }
            }
          }
        } else {
          if (f[0] <= 73.604139) {
            if (f[0] <= 71.242301) {
              if (f[3] <= 0.002728) {
                if (f[0] <= 66.976498) {
                  return 0.005154;
                } else {
                  return -0.025101;
                }
              } else {
                return 0.023325;
              }
            } else {
              return -0.046774;
            }
          } else {
            if (f[7] <= 0.000311) {
              return 0.035025;
            } else {
              if (f[9] <= 0.000321) {
                if (f[16] <= 0.001944) {
                  return -0.003429;
                } else {
                  return 0.017545;
                }
              } else {
                if (f[15] <= 0.000062) {
                  return -0.039862;
                } else {
                  return -0.002677;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[5] <= 0.000000) {
        if (f[16] <= -0.000599) {
          if (f[9] <= 0.000060) {
            return -0.013179;
          } else {
            return 0.014384;
          }
        } else {
          if (f[2] <= 0.193154) {
            if (f[14] <= -0.000175) {
              if (f[10] <= -0.000061) {
                return -0.029894;
              } else {
                return 0.012482;
              }
            } else {
              if (f[9] <= 0.000059) {
                return -0.009491;
              } else {
                return -0.057323;
              }
            }
          } else {
            if (f[0] <= 66.309351) {
              if (f[9] <= 0.000120) {
                if (f[0] <= 47.278078) {
                  return 0.009256;
                } else {
                  return -0.054268;
                }
              } else {
                if (f[4] <= 0.000000) {
                  return 0.030153;
                } else {
                  return 0.008852;
                }
              }
            } else {
              if (f[0] <= 73.604139) {
                if (f[6] <= -0.000053) {
                  return -0.051895;
                } else {
                  return -0.010441;
                }
              } else {
                if (f[16] <= 0.002373) {
                  return 0.006948;
                } else {
                  return -0.015588;
                }
              }
            }
          }
        }
      } else {
        if (f[3] <= 0.001401) {
          if (f[7] <= -0.000583) {
            return 0.023650;
          } else {
            if (f[0] <= 47.278078) {
              if (f[7] <= -0.000540) {
                if (f[2] <= 0.097866) {
                  return -0.030185;
                } else {
                  return 0.002495;
                }
              } else {
                if (f[0] <= 43.894929) {
                  return 0.003558;
                } else {
                  return 0.029942;
                }
              }
            } else {
              if (f[0] <= 54.525383) {
                return -0.051474;
              } else {
                if (f[3] <= 0.001283) {
                  return 0.021003;
                } else {
                  return -0.033552;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[16] <= -0.000578) {
              return -0.030310;
            } else {
              return 0.009614;
            }
          } else {
            if (f[7] <= -0.000564) {
              if (f[16] <= -0.000620) {
                if (f[14] <= -0.000190) {
                  return 0.012616;
                } else {
                  return -0.054673;
                }
              } else {
                if (f[12] <= 0.000063) {
                  return 0.018125;
                } else {
                  return -0.013932;
                }
              }
            } else {
              if (f[3] <= 0.001457) {
                return -0.037602;
              } else {
                if (f[9] <= 0.000062) {
                  return 0.024904;
                } else {
                  return -0.020964;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[8] <= -0.001330) {
              if (f[16] <= -0.000597) {
                if (f[8] <= -0.001403) {
                  return 0.015633;
                } else {
                  return -0.026824;
                }
              } else {
                return 0.026099;
              }
            } else {
              if (f[16] <= -0.000610) {
                if (f[9] <= 0.000060) {
                  return -0.031044;
                } else {
                  return 0.006856;
                }
              } else {
                if (f[14] <= -0.000191) {
                  return -0.043565;
                } else {
                  return -0.005216;
                }
              }
            }
          } else {
            return 0.030434;
          }
        } else {
          if (f[14] <= 0.000838) {
            return -0.048431;
          } else {
            return -0.005123;
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[8] <= 0.000511) {
            if (f[19] <= 0.000000) {
              if (f[16] <= -0.000627) {
                return 0.050109;
              } else {
                if (f[9] <= 0.000097) {
                  return 0.004068;
                } else {
                  return 0.017824;
                }
              }
            } else {
              if (f[9] <= 0.000120) {
                if (f[0] <= 48.323011) {
                  return 0.017857;
                } else {
                  return -0.052937;
                }
              } else {
                return 0.022061;
              }
            }
          } else {
            if (f[1] <= 0.843308) {
              return -0.020711;
            } else {
              return 0.009181;
            }
          }
        } else {
          if (f[16] <= -0.000599) {
            if (f[12] <= 0.000056) {
              return 0.032708;
            } else {
              return 0.000000;
            }
          } else {
            if (f[16] <= 0.000319) {
              if (f[8] <= 0.001309) {
                if (f[10] <= -0.000051) {
                  return -0.030242;
                } else {
                  return 0.010095;
                }
              } else {
                return 0.009089;
              }
            } else {
              if (f[16] <= 0.000833) {
                if (f[2] <= 0.770638) {
                  return 0.019586;
                } else {
                  return -0.007339;
                }
              } else {
                if (f[12] <= 0.000055) {
                  return -0.029131;
                } else {
                  return -0.002040;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[8] <= -0.000329) {
        if (f[3] <= 0.001401) {
          if (f[8] <= -0.001258) {
            if (f[1] <= -5.432159) {
              return 0.038840;
            } else {
              return 0.011478;
            }
          } else {
            if (f[1] <= -5.256701) {
              return -0.044965;
            } else {
              if (f[3] <= 0.001395) {
                if (f[7] <= -0.000552) {
                  return -0.040038;
                } else {
                  return 0.000370;
                }
              } else {
                return 0.027030;
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[16] <= -0.000581) {
              if (f[14] <= -0.000173) {
                return -0.024403;
              } else {
                return -0.049506;
              }
            } else {
              return 0.006349;
            }
          } else {
            if (f[7] <= -0.000432) {
              if (f[16] <= -0.000620) {
                if (f[9] <= 0.000063) {
                  return -0.029017;
                } else {
                  return 0.007261;
                }
              } else {
                if (f[1] <= -5.504141) {
                  return 0.020546;
                } else {
                  return 0.001588;
                }
              }
            } else {
              if (f[8] <= -0.000427) {
                return -0.052235;
              } else {
                return 0.004814;
              }
            }
          }
        }
      } else {
        if (f[15] <= -0.000296) {
          if (f[8] <= 0.001275) {
            if (f[3] <= 0.003867) {
              if (f[8] <= 0.000816) {
                if (f[15] <= -0.000317) {
                  return -0.006741;
                } else {
                  return 0.013287;
                }
              } else {
                return -0.010165;
              }
            } else {
              return 0.029278;
            }
          } else {
            if (f[3] <= 0.004514) {
              return -0.056622;
            } else {
              if (f[8] <= 0.001828) {
                return 0.022913;
              } else {
                return -0.015036;
              }
            }
          }
        } else {
          if (f[15] <= 0.000000) {
            if (f[16] <= 0.000857) {
              if (f[1] <= 5.505217) {
                if (f[8] <= -0.000087) {
                  return 0.008134;
                } else {
                  return -0.021372;
                }
              } else {
                return 0.025944;
              }
            } else {
              return -0.039568;
            }
          } else {
            if (f[15] <= 0.000114) {
              return 0.039662;
            } else {
              if (f[3] <= 0.001333) {
                if (f[9] <= 0.000121) {
                  return 0.001562;
                } else {
                  return 0.027043;
                }
              } else {
                if (f[15] <= 0.000556) {
                  return -0.030148;
                } else {
                  return 0.000154;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[16] <= -0.000480) {
          if (f[3] <= 0.001401) {
            if (f[8] <= -0.001258) {
              if (f[7] <= -0.000584) {
                return 0.037224;
              } else {
                return 0.013379;
              }
            } else {
              if (f[7] <= -0.000540) {
                if (f[3] <= 0.001393) {
                  return -0.038438;
                } else {
                  return 0.004279;
                }
              } else {
                if (f[8] <= -0.000785) {
                  return 0.019186;
                } else {
                  return -0.013114;
                }
              }
            }
          } else {
            if (f[9] <= 0.000060) {
              if (f[7] <= -0.000552) {
                if (f[8] <= -0.000959) {
                  return -0.028635;
                } else {
                  return 0.017087;
                }
              } else {
                return -0.041950;
              }
            } else {
              if (f[7] <= -0.000564) {
                if (f[2] <= 0.102972) {
                  return -0.000380;
                } else {
                  return 0.023443;
                }
              } else {
                if (f[15] <= -0.000307) {
                  return -0.043025;
                } else {
                  return -0.002913;
                }
              }
            }
          }
        } else {
          if (f[20] <= 0.000000) {
            if (f[16] <= 0.000106) {
              return -0.051694;
            } else {
              return -0.000997;
            }
          } else {
            return 0.013448;
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[8] <= 0.000544) {
                if (f[6] <= -0.000212) {
                  return 0.020788;
                } else {
                  return 0.002614;
                }
              } else {
                if (f[16] <= -0.000597) {
                  return 0.021629;
                } else {
                  return -0.023255;
                }
              }
            } else {
              return 0.028891;
            }
          } else {
            if (f[15] <= -0.000300) {
              return 0.034192;
            } else {
              if (f[3] <= 0.001628) {
                return 0.026315;
              } else {
                return -0.011188;
              }
            }
          }
        } else {
          if (f[9] <= 0.000182) {
            if (f[20] <= 0.000000) {
              if (f[8] <= 0.000404) {
                return -0.033311;
              } else {
                return 0.028005;
              }
            } else {
              return -0.044320;
            }
          } else {
            if (f[3] <= 0.002027) {
              return -0.039298;
            } else {
              if (f[8] <= 0.000261) {
                return 0.028057;
              } else {
                if (f[9] <= 0.000321) {
                  return 0.003496;
                } else {
                  return -0.015022;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[5] <= 0.000000) {
        if (f[15] <= -0.000296) {
          if (f[3] <= 0.001873) {
            if (f[20] <= 0.000000) {
              if (f[3] <= 0.001394) {
                if (f[15] <= -0.000309) {
                  return -0.000302;
                } else {
                  return -0.049393;
                }
              } else {
                if (f[0] <= 39.948687) {
                  return 0.034725;
                } else {
                  return -0.000158;
                }
              }
            } else {
              if (f[7] <= -0.000197) {
                if (f[2] <= 0.098621) {
                  return 0.013674;
                } else {
                  return -0.019238;
                }
              } else {
                return 0.031169;
              }
            }
          } else {
            if (f[9] <= 0.000183) {
              if (f[20] <= 0.000000) {
                return 0.005060;
              } else {
                return -0.044975;
              }
            } else {
              if (f[9] <= 0.000210) {
                return 0.025264;
              } else {
                if (f[9] <= 0.000232) {
                  return -0.027664;
                } else {
                  return 0.008642;
                }
              }
            }
          }
        } else {
          if (f[2] <= 0.238769) {
            if (f[10] <= -0.000057) {
              return -0.045608;
            } else {
              return -0.003020;
            }
          } else {
            if (f[0] <= 67.510927) {
              if (f[10] <= -0.000056) {
                if (f[14] <= 0.000665) {
                  return -0.006537;
                } else {
                  return 0.026898;
                }
              } else {
                return 0.017815;
              }
            } else {
              if (f[0] <= 74.169873) {
                if (f[0] <= 71.173329) {
                  return -0.010566;
                } else {
                  return -0.046514;
                }
              } else {
                if (f[16] <= 0.002373) {
                  return 0.008650;
                } else {
                  return -0.019696;
                }
              }
            }
          }
        }
      } else {
        if (f[0] <= 47.278078) {
          if (f[3] <= 0.001401) {
            return 0.003528;
          } else {
            if (f[9] <= 0.000060) {
              if (f[16] <= -0.000578) {
                return -0.028241;
              } else {
                return 0.009505;
              }
            } else {
              if (f[3] <= 0.001457) {
                if (f[7] <= -0.000564) {
                  return 0.003220;
                } else {
                  return -0.034190;
                }
              } else {
                if (f[9] <= 0.000062) {
                  return 0.022290;
                } else {
                  return -0.011539;
                }
              }
            }
          }
        } else {
          if (f[0] <= 54.525383) {
            return -0.049794;
          } else {
            if (f[3] <= 0.001292) {
              return 0.018160;
            } else {
              return -0.038704;
            }
          }
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[5] <= 0.000000) {
        if (f[16] <= -0.000599) {
          if (f[9] <= 0.000060) {
            return -0.006411;
          } else {
            if (f[16] <= -0.000605) {
              if (f[6] <= -0.000212) {
                return 0.028356;
              } else {
                return 0.002075;
              }
            } else {
              return 0.027891;
            }
          }
        } else {
          if (f[2] <= 0.193154) {
            if (f[14] <= -0.000175) {
              if (f[10] <= -0.000061) {
                return -0.029047;
              } else {
                return 0.011819;
              }
            } else {
              if (f[9] <= 0.000059) {
                return -0.008389;
              } else {
                return -0.054654;
              }
            }
          } else {
            if (f[0] <= 66.309351) {
              if (f[9] <= 0.000120) {
                if (f[0] <= 47.278078) {
                  return 0.008699;
                } else {
                  return -0.052094;
                }
              } else {
                if (f[4] <= 0.000000) {
                  return 0.028505;
                } else {
                  return 0.008003;
                }
              }
            } else {
              if (f[0] <= 73.604139) {
                if (f[6] <= -0.000053) {
                  return -0.049792;
                } else {
                  return -0.009578;
                }
              } else {
                if (f[3] <= 0.004801) {
                  return 0.007723;
                } else {
                  return -0.011309;
                }
              }
            }
          }
        }
      } else {
        if (f[0] <= 47.278078) {
          if (f[3] <= 0.001401) {
            if (f[0] <= 43.894929) {
              if (f[3] <= 0.000859) {
                if (f[0] <= 35.984801) {
                  return -0.057396;
                } else {
                  return 0.005928;
                }
              } else {
                if (f[7] <= -0.000585) {
                  return 0.023969;
                } else {
                  return 0.002403;
                }
              }
            } else {
              return 0.028038;
            }
          } else {
            if (f[9] <= 0.000060) {
              if (f[16] <= -0.000578) {
                if (f[14] <= -0.000171) {
                  return -0.021788;
                } else {
                  return -0.047346;
                }
              } else {
                return 0.009219;
              }
            } else {
              if (f[3] <= 0.001457) {
                if (f[7] <= -0.000564) {
                  return 0.003123;
                } else {
                  return -0.033328;
                }
              } else {
                if (f[9] <= 0.000062) {
                  return 0.021642;
                } else {
                  return -0.011203;
                }
              }
            }
          }
        } else {
          if (f[0] <= 54.525383) {
            return -0.048821;
          } else {
            if (f[3] <= 0.001292) {
              return 0.017642;
            } else {
              return -0.037745;
            }
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[9] <= 0.000059) {
              if (f[3] <= 0.001250) {
                return 0.042315;
              } else {
                if (f[1] <= -5.388620) {
                  return 0.030069;
                } else {
                  return -0.007782;
                }
              }
            } else {
              if (f[9] <= 0.000060) {
                if (f[16] <= -0.000581) {
                  return -0.019153;
                } else {
                  return 0.015212;
                }
              } else {
                if (f[6] <= -0.000208) {
                  return 0.005723;
                } else {
                  return -0.007444;
                }
              }
            }
          } else {
            return 0.028594;
          }
        } else {
          if (f[10] <= -0.000053) {
            return -0.047082;
          } else {
            return -0.004915;
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[6] <= -0.000195) {
            return 0.023529;
          } else {
            if (f[9] <= 0.000097) {
              if (f[8] <= -0.000174) {
                return 0.015924;
              } else {
                if (f[9] <= 0.000060) {
                  return 0.005035;
                } else {
                  return -0.029326;
                }
              }
            } else {
              if (f[0] <= 47.278078) {
                return 0.035133;
              } else {
                if (f[9] <= 0.000120) {
                  return -0.038417;
                } else {
                  return 0.013209;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.006322;
              } else {
                if (f[16] <= 0.000385) {
                  return 0.004454;
                } else {
                  return 0.033713;
                }
              }
            } else {
              if (f[3] <= 0.005687) {
                return -0.031610;
              } else {
                return 0.010141;
              }
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.033719;
                } else {
                  return 0.023967;
                }
              } else {
                return -0.048905;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[6] <= 0.001012) {
                  return -0.003302;
                } else {
                  return 0.021536;
                }
              } else {
                return -0.034773;
              }
            }
          }
        }
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[1] <= -2.871715) {
          if (f[3] <= 0.001401) {
            if (f[1] <= -5.388620) {
              return 0.025995;
            } else {
              if (f[1] <= -4.550359) {
                if (f[2] <= 0.097866) {
                  return -0.031127;
                } else {
                  return -0.001867;
                }
              } else {
                if (f[3] <= 0.001079) {
                  return -0.009734;
                } else {
                  return 0.014761;
                }
              }
            }
          } else {
            if (f[3] <= 0.001439) {
              if (f[2] <= 0.097568) {
                if (f[3] <= 0.001415) {
                  return -0.026613;
                } else {
                  return 0.003588;
                }
              } else {
                if (f[16] <= -0.000591) {
                  return -0.039319;
                } else {
                  return -0.006728;
                }
              }
            } else {
              if (f[7] <= -0.000537) {
                if (f[7] <= -0.000610) {
                  return -0.014370;
                } else {
                  return 0.018246;
                }
              } else {
                if (f[8] <= -0.000590) {
                  return -0.049869;
                } else {
                  return 0.014168;
                }
              }
            }
          }
        } else {
          if (f[8] <= -0.000364) {
            if (f[8] <= -0.000839) {
              return 0.023170;
            } else {
              if (f[3] <= 0.000874) {
                return -0.006405;
              } else {
                return -0.047460;
              }
            }
          } else {
            if (f[15] <= 0.000000) {
              if (f[16] <= -0.000578) {
                if (f[2] <= 0.097079) {
                  return 0.015404;
                } else {
                  return -0.016250;
                }
              } else {
                return -0.056666;
              }
            } else {
              return 0.018062;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          return 0.008336;
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.006131;
              } else {
                if (f[16] <= 0.000385) {
                  return 0.004323;
                } else {
                  return 0.032890;
                }
              }
            } else {
              return -0.009319;
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.032863;
                } else {
                  return 0.023291;
                }
              } else {
                return -0.047975;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[1] <= 5.256275) {
                  return -0.009354;
                } else {
                  return 0.005785;
                }
              } else {
                return -0.034071;
              }
            }
          }
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[8] <= -0.000329) {
        if (f[9] <= 0.000134) {
          if (f[1] <= -0.454933) {
            if (f[1] <= -2.871715) {
              if (f[1] <= -3.620421) {
                if (f[15] <= -0.000286) {
                  return -0.000988;
                } else {
                  return -0.018404;
                }
              } else {
                if (f[9] <= 0.000073) {
                  return 0.018394;
                } else {
                  return -0.012360;
                }
              }
            } else {
              if (f[6] <= -0.000194) {
                return -0.052782;
              } else {
                if (f[15] <= -0.000287) {
                  return -0.017855;
                } else {
                  return 0.010463;
                }
              }
            }
          } else {
            return 0.029101;
          }
        } else {
          return -0.035091;
        }
      } else {
        if (f[15] <= -0.000296) {
          if (f[8] <= 0.001275) {
            if (f[0] <= 73.604139) {
              if (f[0] <= 66.309351) {
                if (f[9] <= 0.000150) {
                  return 0.008236;
                } else {
                  return 0.034403;
                }
              } else {
                if (f[16] <= -0.000594) {
                  return 0.011706;
                } else {
                  return -0.020162;
                }
              }
            } else {
              return 0.023792;
            }
          } else {
            if (f[7] <= 0.001088) {
              if (f[6] <= -0.000061) {
                return 0.000980;
              } else {
                return -0.045482;
              }
            } else {
              return 0.009007;
            }
          }
        } else {
          if (f[2] <= 0.193154) {
            if (f[10] <= -0.000057) {
              if (f[15] <= -0.000287) {
                return -0.053924;
              } else {
                return -0.035004;
              }
            } else {
              return -0.001397;
            }
          } else {
            if (f[1] <= 1.878951) {
              if (f[0] <= 59.970216) {
                if (f[0] <= 33.083860) {
                  return 0.014021;
                } else {
                  return -0.004870;
                }
              } else {
                if (f[9] <= 0.000167) {
                  return 0.028633;
                } else {
                  return -0.001199;
                }
              }
            } else {
              if (f[1] <= 5.017849) {
                if (f[15] <= 0.000574) {
                  return -0.030471;
                } else {
                  return -0.002806;
                }
              } else {
                if (f[16] <= 0.001019) {
                  return 0.017925;
                } else {
                  return -0.007301;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[8] <= -0.001330) {
              if (f[3] <= 0.001406) {
                return 0.029875;
              } else {
                if (f[2] <= 0.102972) {
                  return -0.019594;
                } else {
                  return 0.024952;
                }
              }
            } else {
              if (f[3] <= 0.001468) {
                if (f[3] <= 0.001457) {
                  return -0.004403;
                } else {
                  return 0.023693;
                }
              } else {
                if (f[15] <= -0.000309) {
                  return -0.002542;
                } else {
                  return -0.052849;
                }
              }
            }
          } else {
            return 0.027902;
          }
        } else {
          if (f[14] <= 0.000838) {
            return -0.045340;
          } else {
            return -0.004282;
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[8] <= 0.000511) {
            if (f[19] <= 0.000000) {
              if (f[3] <= 0.001873) {
                if (f[15] <= 0.000729) {
                  return 0.017477;
                } else {
                  return -0.002967;
                }
              } else {
                if (f[20] <= 0.000000) {
                  return 0.007778;
                } else {
                  return -0.023934;
                }
              }
            } else {
              if (f[7] <= -0.000025) {
                if (f[3] <= 0.000921) {
                  return -0.001941;
                } else {
                  return -0.042828;
                }
              } else {
                return 0.016833;
              }
            }
          } else {
            if (f[1] <= 0.843308) {
              return -0.019991;
            } else {
              return 0.008123;
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.006320;
              } else {
                if (f[16] <= 0.000385) {
                  return 0.003862;
                } else {
                  return 0.031837;
                }
              }
            } else {
              if (f[3] <= 0.005687) {
                return -0.029863;
              } else {
                return 0.010176;
              }
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.031603;
                } else {
                  return 0.022718;
                }
              } else {
                return -0.047131;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[7] <= 0.001365) {
                  return -0.003961;
                } else {
                  return 0.014565;
                }
              } else {
                return -0.033251;
              }
            }
          }
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[8] <= -0.000329) {
        if (f[9] <= 0.000134) {
          if (f[8] <= -0.001330) {
            if (f[6] <= -0.000212) {
              return -0.010328;
            } else {
              if (f[2] <= 0.102972) {
                return 0.011938;
              } else {
                return 0.027365;
              }
            }
          } else {
            if (f[9] <= 0.000060) {
              if (f[9] <= 0.000059) {
                if (f[2] <= 0.096238) {
                  return 0.019632;
                } else {
                  return -0.005755;
                }
              } else {
                if (f[15] <= -0.000308) {
                  return -0.042306;
                } else {
                  return -0.014750;
                }
              }
            } else {
              if (f[12] <= 0.000052) {
                return -0.026636;
              } else {
                if (f[10] <= -0.000055) {
                  return -0.000751;
                } else {
                  return 0.018526;
                }
              }
            }
          }
        } else {
          return -0.034426;
        }
      } else {
        if (f[15] <= -0.000296) {
          if (f[8] <= 0.001366) {
            if (f[9] <= 0.000232) {
              if (f[8] <= 0.000816) {
                if (f[15] <= -0.000317) {
                  return -0.007932;
                } else {
                  return 0.012009;
                }
              } else {
                if (f[6] <= -0.000116) {
                  return 0.001911;
                } else {
                  return -0.030112;
                }
              }
            } else {
              return 0.028169;
            }
          } else {
            if (f[7] <= 0.001088) {
              if (f[2] <= 0.628328) {
                return -0.006210;
              } else {
                return -0.052231;
              }
            } else {
              return 0.008619;
            }
          }
        } else {
          if (f[2] <= 0.193154) {
            if (f[10] <= -0.000057) {
              if (f[15] <= -0.000287) {
                return -0.052670;
              } else {
                return -0.034040;
              }
            } else {
              return -0.001371;
            }
          } else {
            if (f[15] <= -0.000292) {
              if (f[15] <= -0.000294) {
                return -0.002981;
              } else {
                return -0.050425;
              }
            } else {
              if (f[8] <= 0.000275) {
                if (f[14] <= 0.000630) {
                  return 0.016284;
                } else {
                  return -0.018044;
                }
              } else {
                if (f[7] <= 0.000265) {
                  return -0.022897;
                } else {
                  return 0.001177;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[8] <= -0.000629) {
        if (f[16] <= -0.000480) {
          if (f[3] <= 0.001401) {
            if (f[1] <= -5.388620) {
              return 0.025350;
            } else {
              if (f[7] <= -0.000540) {
                if (f[3] <= 0.001393) {
                  return -0.031082;
                } else {
                  return 0.007288;
                }
              } else {
                if (f[8] <= -0.000785) {
                  return 0.018641;
                } else {
                  return -0.012153;
                }
              }
            }
          } else {
            if (f[6] <= -0.000204) {
              if (f[3] <= 0.001415) {
                if (f[15] <= -0.000295) {
                  return -0.046378;
                } else {
                  return 0.004803;
                }
              } else {
                if (f[16] <= -0.000620) {
                  return -0.017104;
                } else {
                  return 0.003140;
                }
              }
            } else {
              if (f[13] <= -0.000052) {
                return -0.045817;
              } else {
                return -0.014246;
              }
            }
          }
        } else {
          if (f[1] <= -3.962852) {
            return -0.048821;
          } else {
            if (f[6] <= -0.000142) {
              return 0.010234;
            } else {
              return -0.030015;
            }
          }
        }
      } else {
        if (f[0] <= 67.510927) {
          if (f[9] <= 0.000148) {
            if (f[3] <= 0.003522) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000762) {
                  return 0.003779;
                } else {
                  return -0.023844;
                }
              } else {
                if (f[16] <= 0.000385) {
                  return -0.035705;
                } else {
                  return 0.000692;
                }
              }
            } else {
              return 0.028020;
            }
          } else {
            if (f[3] <= 0.001946) {
              if (f[7] <= 0.000368) {
                return 0.033334;
              } else {
                return 0.015392;
              }
            } else {
              return -0.022516;
            }
          }
        } else {
          if (f[9] <= 0.000182) {
            if (f[9] <= 0.000172) {
              return -0.007257;
            } else {
              return -0.046770;
            }
          } else {
            if (f[3] <= 0.002027) {
              return -0.037885;
            } else {
              if (f[0] <= 71.173329) {
                return 0.026087;
              } else {
                if (f[0] <= 73.604139) {
                  return -0.039462;
                } else {
                  return 0.003600;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[1] <= -1.297390) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[9] <= 0.000059) {
              if (f[3] <= 0.001250) {
                return 0.040696;
              } else {
                if (f[1] <= -5.388620) {
                  return 0.028495;
                } else {
                  return -0.007164;
                }
              }
            } else {
              if (f[9] <= 0.000060) {
                if (f[15] <= -0.000308) {
                  return -0.039516;
                } else {
                  return -0.010389;
                }
              } else {
                if (f[6] <= -0.000208) {
                  return 0.005553;
                } else {
                  return -0.006963;
                }
              }
            }
          } else {
            return 0.027067;
          }
        } else {
          if (f[14] <= 0.000838) {
            return -0.044635;
          } else {
            return -0.003772;
          }
        }
      } else {
        if (f[9] <= 0.000167) {
          if (f[1] <= 3.176611) {
            if (f[9] <= 0.000150) {
              if (f[15] <= 0.000787) {
                if (f[15] <= 0.000616) {
                  return 0.004909;
                } else {
                  return 0.036767;
                }
              } else {
                return -0.022754;
              }
            } else {
              if (f[15] <= 0.000432) {
                return 0.020208;
              } else {
                return 0.036636;
              }
            }
          } else {
            if (f[3] <= 0.002978) {
              if (f[15] <= -0.000301) {
                return 0.006597;
              } else {
                if (f[12] <= 0.000056) {
                  return -0.015092;
                } else {
                  return -0.049494;
                }
              }
            } else {
              return 0.019837;
            }
          }
        } else {
          if (f[9] <= 0.000182) {
            if (f[20] <= 0.000000) {
              if (f[1] <= 3.730217) {
                return -0.021057;
              } else {
                return 0.027528;
              }
            } else {
              if (f[10] <= -0.000055) {
                return -0.047229;
              } else {
                return -0.028661;
              }
            }
          } else {
            if (f[3] <= 0.002027) {
              return -0.036840;
            } else {
              if (f[0] <= 71.173329) {
                return 0.025327;
              } else {
                if (f[0] <= 73.604139) {
                  return -0.038731;
                } else {
                  return 0.003492;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.023661;
      } else {
        if (f[1] <= -1.297390) {
          if (f[0] <= 47.278078) {
            if (f[0] <= 43.894929) {
              if (f[6] <= -0.000208) {
                if (f[9] <= 0.000061) {
                  return -0.005718;
                } else {
                  return 0.005929;
                }
              } else {
                if (f[3] <= 0.001403) {
                  return -0.002026;
                } else {
                  return -0.019375;
                }
              }
            } else {
              return 0.026355;
            }
          } else {
            if (f[10] <= -0.000053) {
              return -0.044671;
            } else {
              return -0.004254;
            }
          }
        } else {
          if (f[1] <= 1.878951) {
            if (f[6] <= -0.000195) {
              return 0.021846;
            } else {
              if (f[9] <= 0.000097) {
                if (f[2] <= 0.206857) {
                  return -0.034016;
                } else {
                  return 0.003335;
                }
              } else {
                if (f[0] <= 47.278078) {
                  return 0.033371;
                } else {
                  return 0.005546;
                }
              }
            }
          } else {
            if (f[3] <= 0.001660) {
              if (f[1] <= 3.891699) {
                if (f[3] <= 0.001351) {
                  return 0.006043;
                } else {
                  return -0.023619;
                }
              } else {
                return -0.047036;
              }
            } else {
              if (f[0] <= 66.309351) {
                if (f[1] <= 6.866088) {
                  return 0.002441;
                } else {
                  return 0.031822;
                }
              } else {
                if (f[9] <= 0.000182) {
                  return -0.024304;
                } else {
                  return 0.000451;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[8] <= -0.000329) {
        if (f[9] <= 0.000134) {
          if (f[1] <= -0.529683) {
            if (f[1] <= -2.871715) {
              if (f[3] <= 0.001401) {
                if (f[8] <= -0.001258) {
                  return 0.023041;
                } else {
                  return 0.000066;
                }
              } else {
                if (f[3] <= 0.001415) {
                  return -0.029493;
                } else {
                  return -0.001113;
                }
              }
            } else {
              if (f[6] <= -0.000194) {
                return -0.051060;
              } else {
                if (f[14] <= -0.000175) {
                  return -0.017345;
                } else {
                  return 0.009904;
                }
              }
            }
          } else {
            return 0.025167;
          }
        } else {
          return -0.033444;
        }
      } else {
        if (f[16] <= -0.000599) {
          if (f[2] <= 0.159316) {
            if (f[1] <= -1.533696) {
              if (f[3] <= 0.001405) {
                return -0.006563;
              } else {
                return 0.019732;
              }
            } else {
              return 0.036823;
            }
          } else {
            if (f[6] <= -0.000179) {
              return -0.027211;
            } else {
              if (f[16] <= -0.000603) {
                if (f[8] <= 0.000684) {
                  return -0.025334;
                } else {
                  return 0.016078;
                }
              } else {
                return 0.030886;
              }
            }
          }
        } else {
          if (f[8] <= 0.000417) {
            if (f[2] <= 0.193154) {
              if (f[12] <= 0.000061) {
                if (f[6] <= -0.000195) {
                  return 0.013019;
                } else {
                  return -0.017945;
                }
              } else {
                return -0.039399;
              }
            } else {
              if (f[3] <= 0.001367) {
                if (f[3] <= 0.000989) {
                  return 0.000114;
                } else {
                  return 0.026007;
                }
              } else {
                if (f[14] <= -0.000172) {
                  return 0.006746;
                } else {
                  return -0.015763;
                }
              }
            }
          } else {
            if (f[7] <= 0.000350) {
              if (f[10] <= -0.000063) {
                return 0.000606;
              } else {
                if (f[12] <= 0.000053) {
                  return 0.001791;
                } else {
                  return -0.042167;
                }
              }
            } else {
              if (f[9] <= 0.000132) {
                return 0.019719;
              } else {
                if (f[12] <= 0.000055) {
                  return -0.019687;
                } else {
                  return 0.000139;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.022956;
      } else {
        if (f[8] <= -0.000629) {
          if (f[16] <= -0.000480) {
            if (f[8] <= -0.000771) {
              if (f[3] <= 0.001401) {
                if (f[7] <= -0.000540) {
                  return -0.002470;
                } else {
                  return 0.016154;
                }
              } else {
                if (f[3] <= 0.001415) {
                  return -0.029177;
                } else {
                  return -0.001593;
                }
              }
            } else {
              if (f[10] <= -0.000054) {
                if (f[2] <= 0.096082) {
                  return -0.008213;
                } else {
                  return -0.045806;
                }
              } else {
                return 0.026373;
              }
            }
          } else {
            if (f[8] <= -0.000916) {
              return -0.048272;
            } else {
              if (f[6] <= -0.000134) {
                return 0.009763;
              } else {
                return -0.028203;
              }
            }
          }
        } else {
          if (f[6] <= -0.000212) {
            return 0.018622;
          } else {
            if (f[3] <= 0.001367) {
              if (f[0] <= 60.485816) {
                if (f[1] <= -3.132940) {
                  return 0.019213;
                } else {
                  return -0.000793;
                }
              } else {
                return 0.033278;
              }
            } else {
              if (f[3] <= 0.001393) {
                if (f[1] <= -2.066402) {
                  return -0.008798;
                } else {
                  return -0.057284;
                }
              } else {
                if (f[1] <= -1.805041) {
                  return -0.016260;
                } else {
                  return 0.002016;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.022310;
      } else {
        if (f[12] <= 0.000058) {
          if (f[12] <= 0.000057) {
            if (f[7] <= -0.000382) {
              if (f[7] <= -0.000417) {
                if (f[2] <= 0.100539) {
                  return 0.001898;
                } else {
                  return -0.011515;
                }
              } else {
                return -0.044019;
              }
            } else {
              if (f[16] <= 0.000833) {
                if (f[3] <= 0.003867) {
                  return 0.006315;
                } else {
                  return 0.026955;
                }
              } else {
                if (f[6] <= 0.000626) {
                  return -0.025398;
                } else {
                  return 0.006110;
                }
              }
            }
          } else {
            if (f[6] <= -0.000209) {
              return 0.006168;
            } else {
              if (f[6] <= 0.000159) {
                if (f[4] <= 0.000000) {
                  return -0.017787;
                } else {
                  return -0.048643;
                }
              } else {
                return -0.001903;
              }
            }
          }
        } else {
          if (f[10] <= -0.000061) {
            if (f[6] <= 0.000310) {
              if (f[0] <= 53.575789) {
                if (f[9] <= 0.000116) {
                  return -0.000736;
                } else {
                  return -0.036066;
                }
              } else {
                if (f[3] <= 0.001893) {
                  return 0.018170;
                } else {
                  return -0.000115;
                }
              }
            } else {
              if (f[0] <= 68.133933) {
                return -0.001710;
              } else {
                if (f[7] <= 0.001611) {
                  return -0.046438;
                } else {
                  return 0.000000;
                }
              }
            }
          } else {
            if (f[16] <= 0.001777) {
              if (f[16] <= 0.001056) {
                if (f[10] <= -0.000060) {
                  return 0.019964;
                } else {
                  return 0.004870;
                }
              } else {
                return -0.037412;
              }
            } else {
              if (f[0] <= 80.736033) {
                return 0.034994;
              } else {
                return 0.007719;
              }
            }
          }
        }
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[14] <= -0.000201) {
        return 0.018790;
      } else {
        if (f[14] <= -0.000198) {
          return -0.027813;
        } else {
          if (f[8] <= -0.000629) {
            if (f[6] <= -0.000142) {
              if (f[3] <= 0.001401) {
                if (f[1] <= -5.388620) {
                  return 0.024794;
                } else {
                  return -0.001488;
                }
              } else {
                if (f[6] <= -0.000204) {
                  return -0.004211;
                } else {
                  return -0.035052;
                }
              }
            } else {
              if (f[3] <= 0.001270) {
                return -0.048105;
              } else {
                return 0.001864;
              }
            }
          } else {
            if (f[6] <= -0.000212) {
              return 0.019539;
            } else {
              if (f[14] <= -0.000193) {
                if (f[12] <= 0.000068) {
                  return -0.034443;
                } else {
                  return 0.015637;
                }
              } else {
                if (f[3] <= 0.001364) {
                  return 0.005643;
                } else {
                  return -0.000597;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[1] <= -0.637435) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[2] <= 0.372288) {
              if (f[2] <= 0.295645) {
                if (f[10] <= -0.000070) {
                  return 0.016049;
                } else {
                  return -0.002793;
                }
              } else {
                return 0.022346;
              }
            } else {
              return -0.028733;
            }
          } else {
            return 0.027086;
          }
        } else {
          if (f[14] <= -0.000174) {
            return -0.046174;
          } else {
            if (f[3] <= 0.001333) {
              return 0.006341;
            } else {
              return -0.035036;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[6] <= -0.000195) {
            return 0.028684;
          } else {
            if (f[0] <= 54.525383) {
              if (f[14] <= -0.000172) {
                if (f[0] <= 47.866888) {
                  return 0.012392;
                } else {
                  return -0.013266;
                }
              } else {
                if (f[14] <= 0.000178) {
                  return -0.040455;
                } else {
                  return 0.005032;
                }
              }
            } else {
              if (f[3] <= 0.001162) {
                return 0.039201;
              } else {
                if (f[15] <= -0.000292) {
                  return -0.001848;
                } else {
                  return 0.014454;
                }
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[15] <= -0.000314) {
              if (f[16] <= 0.000106) {
                return 0.013724;
              } else {
                return -0.033284;
              }
            } else {
              if (f[10] <= -0.000062) {
                return 0.024140;
              } else {
                if (f[16] <= 0.000510) {
                  return -0.015319;
                } else {
                  return 0.017803;
                }
              }
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[0] <= 54.180589) {
                return 0.001159;
              } else {
                if (f[2] <= 0.829159) {
                  return -0.048086;
                } else {
                  return -0.013771;
                }
              }
            } else {
              if (f[16] <= 0.002373) {
                if (f[16] <= 0.001944) {
                  return -0.002749;
                } else {
                  return 0.018439;
                }
              } else {
                if (f[16] <= 0.003716) {
                  return -0.033932;
                } else {
                  return 0.004510;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.021897;
      } else {
        if (f[1] <= -1.297390) {
          if (f[0] <= 47.278078) {
            if (f[0] <= 43.894929) {
              if (f[1] <= -2.871715) {
                if (f[9] <= 0.000087) {
                  return 0.000204;
                } else {
                  return -0.038630;
                }
              } else {
                if (f[8] <= -0.000446) {
                  return -0.039478;
                } else {
                  return -0.001682;
                }
              }
            } else {
              return 0.024990;
            }
          } else {
            if (f[14] <= 0.000838) {
              return -0.042997;
            } else {
              return -0.003109;
            }
          }
        } else {
          if (f[1] <= 1.878951) {
            if (f[8] <= 0.000511) {
              if (f[8] <= 0.000385) {
                if (f[19] <= 0.000000) {
                  return 0.008759;
                } else {
                  return -0.007116;
                }
              } else {
                return 0.023624;
              }
            } else {
              if (f[1] <= 0.843308) {
                return -0.019595;
              } else {
                return 0.007182;
              }
            }
          } else {
            if (f[3] <= 0.001660) {
              if (f[1] <= 3.891699) {
                if (f[3] <= 0.001351) {
                  return 0.005471;
                } else {
                  return -0.022463;
                }
              } else {
                return -0.045679;
              }
            } else {
              if (f[0] <= 66.309351) {
                if (f[1] <= 6.866088) {
                  return 0.002216;
                } else {
                  return 0.030535;
                }
              } else {
                if (f[9] <= 0.000182) {
                  return -0.023422;
                } else {
                  return 0.000489;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[14] <= -0.000201) {
        return 0.018032;
      } else {
        if (f[14] <= -0.000198) {
          return -0.027047;
        } else {
          if (f[8] <= -0.000629) {
            if (f[6] <= -0.000142) {
              if (f[3] <= 0.001401) {
                if (f[1] <= -5.388620) {
                  return 0.024242;
                } else {
                  return -0.001294;
                }
              } else {
                if (f[6] <= -0.000204) {
                  return -0.004027;
                } else {
                  return -0.034334;
                }
              }
            } else {
              if (f[3] <= 0.001270) {
                return -0.047217;
              } else {
                return 0.001624;
              }
            }
          } else {
            if (f[6] <= -0.000212) {
              return 0.019083;
            } else {
              if (f[14] <= -0.000193) {
                if (f[12] <= 0.000068) {
                  return -0.033406;
                } else {
                  return 0.014977;
                }
              } else {
                if (f[3] <= 0.001364) {
                  return 0.005405;
                } else {
                  return -0.000602;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.021479;
      } else {
        if (f[9] <= 0.000057) {
          return -0.030666;
        } else {
          if (f[14] <= -0.000201) {
            return 0.017511;
          } else {
            if (f[14] <= -0.000198) {
              return -0.025847;
            } else {
              if (f[12] <= 0.000059) {
                if (f[14] <= -0.000184) {
                  return 0.008036;
                } else {
                  return -0.004474;
                }
              } else {
                if (f[10] <= -0.000061) {
                  return -0.000495;
                } else {
                  return 0.009462;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[1] <= -0.637435) {
        if (f[9] <= 0.000113) {
          if (f[2] <= 0.040103) {
            if (f[15] <= -0.000305) {
              return 0.027368;
            } else {
              return -0.013120;
            }
          } else {
            if (f[15] <= -0.000310) {
              if (f[6] <= -0.000207) {
                if (f[8] <= -0.000608) {
                  return -0.012311;
                } else {
                  return 0.014264;
                }
              } else {
                return -0.042845;
              }
            } else {
              if (f[1] <= -4.213230) {
                if (f[3] <= 0.001239) {
                  return -0.049156;
                } else {
                  return -0.001849;
                }
              } else {
                if (f[1] <= -3.005791) {
                  return 0.010278;
                } else {
                  return -0.002897;
                }
              }
            }
          }
        } else {
          if (f[14] <= -0.000174) {
            return -0.045252;
          } else {
            if (f[3] <= 0.001333) {
              return 0.009854;
            } else {
              return -0.034299;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[20] <= 0.000000) {
            if (f[4] <= 0.000000) {
              if (f[9] <= 0.000121) {
                if (f[8] <= -0.000174) {
                  return 0.018252;
                } else {
                  return -0.028044;
                }
              } else {
                return 0.015290;
              }
            } else {
              return -0.028434;
            }
          } else {
            if (f[3] <= 0.001676) {
              if (f[16] <= -0.000584) {
                return 0.033776;
              } else {
                if (f[8] <= 0.000346) {
                  return 0.021966;
                } else {
                  return -0.006089;
                }
              }
            } else {
              if (f[15] <= -0.000289) {
                return -0.025231;
              } else {
                return 0.006336;
              }
            }
          }
        } else {
          if (f[15] <= -0.000304) {
            if (f[8] <= 0.001309) {
              if (f[15] <= -0.000314) {
                return -0.006678;
              } else {
                if (f[16] <= 0.000385) {
                  return 0.003297;
                } else {
                  return 0.030326;
                }
              }
            } else {
              return -0.008672;
            }
          } else {
            if (f[3] <= 0.001692) {
              if (f[1] <= 3.176611) {
                if (f[15] <= 0.000616) {
                  return -0.030014;
                } else {
                  return 0.021269;
                }
              } else {
                return -0.043794;
              }
            } else {
              if (f[8] <= 0.002859) {
                if (f[6] <= 0.001012) {
                  return -0.002769;
                } else {
                  return 0.020025;
                }
              } else {
                return -0.032503;
              }
            }
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.020885;
      } else {
        if (f[1] <= -1.297390) {
          if (f[1] <= -2.871715) {
            if (f[1] <= -3.540991) {
              if (f[15] <= -0.000286) {
                if (f[10] <= -0.000070) {
                  return 0.022807;
                } else {
                  return -0.001518;
                }
              } else {
                if (f[10] <= -0.000052) {
                  return -0.027475;
                } else {
                  return -0.001859;
                }
              }
            } else {
              if (f[3] <= 0.001079) {
                if (f[20] <= 0.000000) {
                  return -0.045163;
                } else {
                  return 0.006893;
                }
              } else {
                if (f[3] <= 0.001381) {
                  return 0.027325;
                } else {
                  return -0.004685;
                }
              }
            }
          } else {
            if (f[8] <= -0.000364) {
              if (f[8] <= -0.000827) {
                return 0.021295;
              } else {
                if (f[3] <= 0.000874) {
                  return -0.005358;
                } else {
                  return -0.043771;
                }
              }
            } else {
              if (f[15] <= 0.000000) {
                if (f[3] <= 0.001393) {
                  return -0.022210;
                } else {
                  return 0.013638;
                }
              } else {
                return 0.017499;
              }
            }
          }
        } else {
          if (f[6] <= -0.000195) {
            return 0.020088;
          } else {
            if (f[8] <= 0.000193) {
              if (f[19] <= 0.000000) {
                if (f[15] <= -0.000310) {
                  return -0.007987;
                } else {
                  return 0.011427;
                }
              } else {
                if (f[8] <= -0.000095) {
                  return -0.030874;
                } else {
                  return 0.009531;
                }
              }
            } else {
              if (f[1] <= 0.049700) {
                return -0.033142;
              } else {
                if (f[15] <= -0.000310) {
                  return 0.011060;
                } else {
                  return -0.002515;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[14] <= -0.000201) {
        return 0.017125;
      } else {
        if (f[14] <= -0.000198) {
          return -0.025425;
        } else {
          if (f[12] <= 0.000047) {
            return 0.020308;
          } else {
            if (f[9] <= 0.000057) {
              return -0.029301;
            } else {
              if (f[12] <= 0.000059) {
                if (f[10] <= -0.000059) {
                  return -0.014319;
                } else {
                  return -0.000606;
                }
              } else {
                if (f[10] <= -0.000061) {
                  return -0.000685;
                } else {
                  return 0.008648;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[12] <= 0.000047) {
        return 0.019749;
      } else {
        if (f[9] <= 0.000057) {
          return -0.028932;
        } else {
          if (f[9] <= 0.000321) {
            if (f[3] <= 0.003956) {
              if (f[7] <= 0.001611) {
                if (f[16] <= 0.001056) {
                  return 0.000053;
                } else {
                  return -0.012920;
                }
              } else {
                return 0.026402;
              }
            } else {
              if (f[3] <= 0.004801) {
                if (f[8] <= 0.001159) {
                  return 0.041000;
                } else {
                  return 0.010021;
                }
              } else {
                if (f[9] <= 0.000246) {
                  return 0.024934;
                } else {
                  return -0.022316;
                }
              }
            }
          } else {
            if (f[15] <= 0.000062) {
              return -0.037616;
            } else {
              return 0.000320;
            }
          }
        }
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[1] <= -0.637435) {
        if (f[0] <= 47.278078) {
          if (f[0] <= 43.894929) {
            if (f[2] <= 0.372288) {
              if (f[2] <= 0.295645) {
                if (f[13] <= -0.000070) {
                  return 0.014977;
                } else {
                  return -0.002536;
                }
              } else {
                return 0.021638;
              }
            } else {
              return -0.028186;
            }
          } else {
            return 0.025834;
          }
        } else {
          if (f[14] <= -0.000174) {
            return -0.044433;
          } else {
            if (f[3] <= 0.001333) {
              return 0.005735;
            } else {
              return -0.033700;
            }
          }
        }
      } else {
        if (f[1] <= 1.878951) {
          if (f[20] <= 0.000000) {
            if (f[4] <= 0.000000) {
              if (f[0] <= 51.663792) {
                if (f[8] <= -0.000174) {
                  return 0.017684;
                } else {
                  return -0.027312;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return 0.039988;
                } else {
                  return 0.006014;
                }
              }
            } else {
              if (f[0] <= 59.515844) {
                return -0.041433;
              } else {
                return -0.006166;
              }
            }
          } else {
            if (f[3] <= 0.001676) {
              if (f[16] <= -0.000584) {
                return 0.032873;
              } else {
                if (f[8] <= 0.000346) {
                  return 0.021305;
                } else {
                  return -0.005866;
                }
              }
            } else {
              if (f[15] <= -0.000289) {
                return -0.024405;
              } else {
                return 0.006194;
              }
            }
          }
        } else {
          if (f[3] <= 0.003773) {
            if (f[14] <= -0.000178) {
              if (f[14] <= -0.000192) {
                return -0.025139;
              } else {
                if (f[1] <= 5.847266) {
                  return 0.012855;
                } else {
                  return -0.022037;
                }
              }
            } else {
              if (f[0] <= 79.370091) {
                if (f[0] <= 67.510927) {
                  return -0.004692;
                } else {
                  return -0.023796;
                }
              } else {
                return 0.017406;
              }
            }
          } else {
            if (f[1] <= 8.694274) {
              if (f[13] <= -0.000062) {
                return 0.032550;
              } else {
                return 0.018567;
              }
            } else {
              if (f[14] <= -0.000169) {
                if (f[0] <= 77.493008) {
                  return 0.014497;
                } else {
                  return -0.023909;
                }
              } else {
                if (f[15] <= 0.001250) {
                  return 0.026950;
                } else {
                  return -0.009610;
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
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.780670;
            } else {
              return 0.743609;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.773227;
            } else {
              return 0.801684;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return 0.719341;
            } else {
              return 0.793252;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.801684;
            } else {
              return 0.777292;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return 0.613281;
          } else {
            if (f[6] <= -0.000018) {
              return 0.574031;
            } else {
              return 0.596796;
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            return 0.717368;
          } else {
            if (f[6] <= -0.000045) {
              return 0.653709;
            } else {
              return 0.574031;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[8] <= -0.001060) {
          if (f[1] <= -5.590338) {
            return 0.026570;
          } else {
            if (f[1] <= -5.237910) {
              return 0.069892;
            } else {
              return 0.043283;
            }
          }
        } else {
          if (f[19] <= 0.000000) {
            if (f[1] <= 8.967185) {
              return 0.012971;
            } else {
              return 0.067281;
            }
          } else {
            if (f[2] <= 0.467063) {
              return 0.072971;
            } else {
              return 0.060939;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[3] <= 0.001287) {
            if (f[7] <= -0.000217) {
              return -0.129043;
            } else {
              return -0.139976;
            }
          } else {
            if (f[3] <= 0.001394) {
              return -0.085688;
            } else {
              return -0.131272;
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            return -0.009618;
          } else {
            if (f[2] <= 0.634146) {
              return -0.068101;
            } else {
              return -0.139113;
            }
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.050417;
            } else {
              return 0.014166;
            }
          } else {
            if (f[10] <= -0.000060) {
              return 0.046015;
            } else {
              return 0.071827;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return -0.008756;
            } else {
              return 0.062340;
            }
          } else {
            if (f[16] <= 0.001762) {
              return 0.071893;
            } else {
              return 0.047542;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.094962;
          } else {
            if (f[15] <= -0.000183) {
              return -0.128674;
            } else {
              return -0.108561;
            }
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[12] <= 0.000060) {
              return -0.065975;
            } else {
              return 0.008951;
            }
          } else {
            return -0.126083;
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[3] <= 0.001373) {
        if (f[16] <= 0.000389) {
          if (f[19] <= 0.000000) {
            if (f[3] <= 0.001136) {
              return -0.060315;
            } else {
              return -0.004994;
            }
          } else {
            return 0.054267;
          }
        } else {
          return -0.101824;
        }
      } else {
        if (f[2] <= 0.573964) {
          if (f[16] <= -0.000617) {
            if (f[6] <= -0.000217) {
              return 0.029030;
            } else {
              return 0.065620;
            }
          } else {
            if (f[16] <= -0.000592) {
              return -0.003078;
            } else {
              return 0.041146;
            }
          }
        } else {
          if (f[6] <= 0.000033) {
            if (f[7] <= 0.000328) {
              return -0.015164;
            } else {
              return -0.088414;
            }
          } else {
            if (f[1] <= 7.395229) {
              return -0.005951;
            } else {
              return 0.040214;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.048234;
            } else {
              return 0.013538;
            }
          } else {
            if (f[10] <= -0.000060) {
              return 0.043630;
            } else {
              return 0.069763;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return -0.007738;
            } else {
              return 0.060191;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.070248;
            } else {
              return 0.044462;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.087640;
          } else {
            if (f[6] <= -0.000018) {
              return -0.116864;
            } else {
              return -0.096288;
            }
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[21] <= 0.602426) {
              return -0.070788;
            } else {
              return -0.002527;
            }
          } else {
            return -0.115748;
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[1] <= -1.967679) {
            if (f[8] <= -0.000707) {
              return 0.046408;
            } else {
              return -0.000629;
            }
          } else {
            if (f[6] <= -0.000143) {
              return 0.070304;
            } else {
              return 0.012379;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return -0.007331;
            } else {
              return 0.058804;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.068875;
            } else {
              return 0.043072;
            }
          }
        }
      } else {
        if (f[14] <= -0.000190) {
          return -0.026129;
        } else {
          if (f[3] <= 0.001287) {
            if (f[21] <= 0.659880) {
              return -0.110386;
            } else {
              return -0.107497;
            }
          } else {
            if (f[21] <= 0.688336) {
              return -0.090353;
            } else {
              return -0.030174;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[8] <= -0.001060) {
          if (f[21] <= 0.132758) {
            return 0.018765;
          } else {
            if (f[12] <= 0.000056) {
              return 0.040138;
            } else {
              return 0.065334;
            }
          }
        } else {
          if (f[9] <= 0.000059) {
            return -0.034071;
          } else {
            if (f[8] <= -0.000543) {
              return -0.012367;
            } else {
              return 0.030806;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.077867;
          } else {
            if (f[15] <= -0.000183) {
              return -0.103984;
            } else {
              return -0.084964;
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            return -0.000563;
          } else {
            if (f[0] <= 73.553031) {
              return -0.055131;
            } else {
              return -0.109958;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.044905;
            } else {
              return 0.010410;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.037016;
            } else {
              return 0.067452;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return -0.008292;
            } else {
              return 0.056822;
            }
          } else {
            if (f[16] <= 0.001762) {
              return 0.067129;
            } else {
              return 0.041561;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.073421;
          } else {
            if (f[6] <= -0.000018) {
              return -0.098690;
            } else {
              return -0.080471;
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            return -0.000535;
          } else {
            if (f[16] <= -0.000125) {
              return -0.049743;
            } else {
              return -0.103119;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[16] <= -0.000617) {
        if (f[6] <= -0.000217) {
          if (f[15] <= -0.000317) {
            return 0.048332;
          } else {
            return -0.002615;
          }
        } else {
          if (f[10] <= -0.000061) {
            return 0.069957;
          } else {
            return 0.044058;
          }
        }
      } else {
        if (f[19] <= 0.000000) {
          if (f[3] <= 0.001136) {
            if (f[16] <= -0.000212) {
              return -0.086470;
            } else {
              return -0.016304;
            }
          } else {
            if (f[16] <= 0.001450) {
              return -0.006965;
            } else {
              return 0.023761;
            }
          }
        } else {
          if (f[6] <= -0.000087) {
            return 0.058797;
          } else {
            return 0.021313;
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.043076;
            } else {
              return 0.010174;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.035783;
            } else {
              return 0.066318;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[19] <= 0.000000) {
              return -0.007231;
            } else {
              return 0.054891;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.065701;
            } else {
              return 0.038545;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[12] <= 0.000059) {
            if (f[2] <= 0.132011) {
              return -0.097061;
            } else {
              return -0.085344;
            }
          } else {
            if (f[13] <= -0.000062) {
              return -0.090966;
            } else {
              return -0.050155;
            }
          }
        } else {
          if (f[7] <= 0.000354) {
            return -0.008099;
          } else {
            return -0.078778;
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[8] <= -0.001060) {
          if (f[21] <= 0.132758) {
            return 0.015038;
          } else {
            if (f[12] <= 0.000056) {
              return 0.037190;
            } else {
              return 0.062627;
            }
          }
        } else {
          if (f[9] <= 0.000059) {
            return -0.035378;
          } else {
            if (f[8] <= -0.000543) {
              return -0.014740;
            } else {
              return 0.028263;
            }
          }
        }
      } else {
        if (f[14] <= -0.000190) {
          return -0.018782;
        } else {
          if (f[3] <= 0.001287) {
            if (f[3] <= 0.001145) {
              return -0.087700;
            } else {
              return -0.091940;
            }
          } else {
            if (f[21] <= 0.688336) {
              return -0.073517;
            } else {
              return -0.018967;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[16] <= -0.000589) {
            if (f[16] <= -0.000607) {
              return 0.041061;
            } else {
              return 0.008917;
            }
          } else {
            if (f[14] <= -0.000180) {
              return 0.034202;
            } else {
              return 0.065243;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[9] <= 0.000135) {
              return 0.016571;
            } else {
              return -0.020737;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.064294;
            } else {
              return 0.036474;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.668969) {
            if (f[9] <= 0.000152) {
              return -0.080365;
            } else {
              return -0.038103;
            }
          } else {
            return 0.000749;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.070024;
          } else {
            return -0.091778;
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[21] <= 0.080897) {
          return -0.026374;
        } else {
          if (f[1] <= -5.237910) {
            if (f[3] <= 0.001453) {
              return 0.065769;
            } else {
              return 0.025641;
            }
          } else {
            if (f[16] <= 0.001322) {
              return 0.012503;
            } else {
              return 0.054326;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.059644;
          } else {
            if (f[14] <= -0.000163) {
              return -0.084185;
            } else {
              return -0.065533;
            }
          }
        } else {
          if (f[14] <= -0.000184) {
            return 0.004918;
          } else {
            if (f[16] <= -0.000125) {
              return -0.040129;
            } else {
              return -0.089553;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[8] <= -0.001060) {
          if (f[1] <= -5.590338) {
            return 0.007425;
          } else {
            if (f[1] <= -5.237910) {
              return 0.060595;
            } else {
              return 0.032411;
            }
          }
        } else {
          if (f[9] <= 0.000058) {
            return -0.068186;
          } else {
            if (f[8] <= -0.000543) {
              return -0.016215;
            } else {
              return 0.024499;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[3] <= 0.001287) {
            if (f[3] <= 0.001067) {
              return -0.070974;
            } else {
              return -0.082294;
            }
          } else {
            if (f[3] <= 0.001394) {
              return -0.036838;
            } else {
              return -0.081271;
            }
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[14] <= -0.000181) {
              return 0.039773;
            } else {
              return -0.055117;
            }
          } else {
            return -0.085958;
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[21] <= 0.495524) {
        if (f[8] <= -0.001060) {
          if (f[1] <= -5.590338) {
            return 0.007083;
          } else {
            if (f[3] <= 0.001428) {
              return 0.065256;
            } else {
              return 0.040585;
            }
          }
        } else {
          if (f[9] <= 0.000059) {
            return -0.037230;
          } else {
            if (f[8] <= -0.000543) {
              return -0.017493;
            } else {
              return 0.025699;
            }
          }
        }
      } else {
        if (f[3] <= 0.001303) {
          if (f[15] <= -0.000299) {
            return -0.062402;
          } else {
            if (f[14] <= -0.000172) {
              return -0.087052;
            } else {
              return -0.078366;
            }
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[16] <= 0.000518) {
              return -0.044759;
            } else {
              return 0.022903;
            }
          } else {
            return -0.082300;
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[8] <= -0.000489) {
            if (f[8] <= -0.000707) {
              return 0.037979;
            } else {
              return -0.040406;
            }
          } else {
            if (f[6] <= -0.000143) {
              return 0.055473;
            } else {
              return 0.002551;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[0] <= 71.365639) {
              return 0.005620;
            } else {
              return -0.038738;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.062196;
            } else {
              return 0.032050;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.688336) {
            if (f[9] <= 0.000152) {
              return -0.068451;
            } else {
              return -0.027192;
            }
          } else {
            return 0.012532;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.059993;
          } else {
            return -0.081358;
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[16] <= -0.000617) {
        if (f[9] <= 0.000061) {
          return 0.008513;
        } else {
          if (f[2] <= 0.096036) {
            return 0.036121;
          } else {
            return 0.064912;
          }
        }
      } else {
        if (f[19] <= 0.000000) {
          if (f[3] <= 0.001136) {
            if (f[16] <= -0.000212) {
              return -0.075786;
            } else {
              return -0.008793;
            }
          } else {
            if (f[9] <= 0.000060) {
              return 0.015154;
            } else {
              return -0.009403;
            }
          }
        } else {
          if (f[9] <= 0.000111) {
            return 0.018979;
          } else {
            return 0.057015;
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[2] <= 0.595710) {
          if (f[1] <= -1.740223) {
            if (f[9] <= 0.000067) {
              return 0.023172;
            } else {
              return -0.048097;
            }
          } else {
            if (f[12] <= 0.000057) {
              return 0.033547;
            } else {
              return 0.067456;
            }
          }
        } else {
          if (f[9] <= 0.000193) {
            if (f[14] <= -0.000178) {
              return -0.106882;
            } else {
              return -0.004651;
            }
          } else {
            if (f[16] <= 0.000973) {
              return -0.023624;
            } else {
              return 0.050929;
            }
          }
        }
      } else {
        if (f[16] <= -0.000604) {
          if (f[6] <= -0.000211) {
            return -0.050671;
          } else {
            return 0.014725;
          }
        } else {
          if (f[16] <= 0.000518) {
            if (f[3] <= 0.001309) {
              return -0.068173;
            } else {
              return -0.085382;
            }
          } else {
            return -0.023714;
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[21] <= 0.080897) {
          return -0.028115;
        } else {
          if (f[8] <= -0.001060) {
            if (f[3] <= 0.001453) {
              return 0.054992;
            } else {
              return 0.024438;
            }
          } else {
            if (f[8] <= 0.001156) {
              return 0.007032;
            } else {
              return 0.046296;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.668969) {
            if (f[9] <= 0.000152) {
              return -0.065557;
            } else {
              return -0.027572;
            }
          } else {
            return 0.008072;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.055432;
          } else {
            return -0.077206;
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[2] <= 0.595710) {
          if (f[1] <= -1.740223) {
            if (f[8] <= -0.000707) {
              return 0.033373;
            } else {
              return -0.014830;
            }
          } else {
            if (f[9] <= 0.000059) {
              return 0.010825;
            } else {
              return 0.058144;
            }
          }
        } else {
          if (f[9] <= 0.000190) {
            if (f[14] <= -0.000178) {
              return -0.106101;
            } else {
              return -0.002777;
            }
          } else {
            if (f[16] <= 0.000973) {
              return -0.023570;
            } else {
              return 0.046642;
            }
          }
        }
      } else {
        if (f[16] <= -0.000604) {
          if (f[6] <= -0.000211) {
            return -0.046759;
          } else {
            return 0.015739;
          }
        } else {
          if (f[16] <= 0.000518) {
            if (f[21] <= 0.547079) {
              return -0.085240;
            } else {
              return -0.066322;
            }
          } else {
            return -0.020983;
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000572) {
          if (f[8] <= -0.000489) {
            if (f[8] <= -0.000707) {
              return 0.034053;
            } else {
              return -0.039697;
            }
          } else {
            if (f[3] <= 0.002741) {
              return 0.052910;
            } else {
              return -0.000087;
            }
          }
        } else {
          if (f[16] <= 0.001450) {
            if (f[20] <= 0.000000) {
              return -0.021146;
            } else {
              return 0.015174;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.060278;
            } else {
              return 0.026733;
            }
          }
        }
      } else {
        if (f[15] <= -0.000298) {
          if (f[21] <= 0.591348) {
            return -0.056637;
          } else {
            if (f[3] <= 0.001465) {
              return -0.050062;
            } else {
              return 0.047201;
            }
          }
        } else {
          if (f[1] <= 1.997669) {
            if (f[10] <= -0.000053) {
              return -0.074021;
            } else {
              return -0.053155;
            }
          } else {
            return -0.039704;
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[2] <= 0.595710) {
          if (f[1] <= -1.740223) {
            if (f[7] <= -0.000421) {
              return 0.028760;
            } else {
              return -0.026775;
            }
          } else {
            if (f[12] <= 0.000054) {
              return 0.006021;
            } else {
              return 0.057016;
            }
          }
        } else {
          if (f[9] <= 0.000193) {
            if (f[14] <= -0.000178) {
              return -0.090998;
            } else {
              return -0.003776;
            }
          } else {
            if (f[7] <= 0.000936) {
              return -0.000297;
            } else {
              return 0.052361;
            }
          }
        }
      } else {
        if (f[15] <= -0.000298) {
          if (f[21] <= 0.679229) {
            if (f[3] <= 0.001462) {
              return -0.050196;
            } else {
              return -0.024516;
            }
          } else {
            return 0.015086;
          }
        } else {
          if (f[12] <= 0.000061) {
            if (f[6] <= -0.000146) {
              return -0.061364;
            } else {
              return -0.075303;
            }
          } else {
            return -0.036767;
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[21] <= 0.080897) {
          return -0.027298;
        } else {
          if (f[7] <= 0.000797) {
            if (f[2] <= 0.595710) {
              return 0.023594;
            } else {
              return -0.031679;
            }
          } else {
            if (f[1] <= 7.310063) {
              return 0.023340;
            } else {
              return 0.063615;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.688336) {
            if (f[9] <= 0.000152) {
              return -0.057181;
            } else {
              return -0.018104;
            }
          } else {
            return 0.015442;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.048512;
          } else {
            return -0.071629;
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[21] <= 0.080897) {
          return -0.025655;
        } else {
          if (f[8] <= -0.001060) {
            if (f[16] <= -0.000591) {
              return 0.032907;
            } else {
              return 0.062551;
            }
          } else {
            if (f[8] <= -0.000543) {
              return -0.019336;
            } else {
              return 0.019174;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.668969) {
            if (f[9] <= 0.000152) {
              return -0.056806;
            } else {
              return -0.020938;
            }
          } else {
            return 0.009776;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.047042;
          } else {
            return -0.070189;
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[9] <= 0.000135) {
          if (f[1] <= -1.740223) {
            if (f[9] <= 0.000067) {
              return 0.018288;
            } else {
              return -0.045176;
            }
          } else {
            if (f[14] <= -0.000158) {
              return 0.059574;
            } else {
              return 0.008464;
            }
          }
        } else {
          if (f[9] <= 0.000190) {
            if (f[1] <= 2.479431) {
              return 0.018464;
            } else {
              return -0.073638;
            }
          } else {
            if (f[0] <= 74.648808) {
              return 0.057517;
            } else {
              return 0.008409;
            }
          }
        }
      } else {
        if (f[3] <= 0.001287) {
          if (f[12] <= 0.000061) {
            return -0.071901;
          } else {
            return -0.050527;
          }
        } else {
          if (f[15] <= -0.000298) {
            if (f[21] <= 0.591348) {
              return -0.036829;
            } else {
              return 0.013923;
            }
          } else {
            if (f[12] <= 0.000061) {
              return -0.059739;
            } else {
              return -0.021527;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000617) {
          if (f[7] <= -0.000545) {
            if (f[3] <= 0.001459) {
              return 0.043314;
            } else {
              return 0.006826;
            }
          } else {
            return 0.063115;
          }
        } else {
          if (f[19] <= 0.000000) {
            if (f[1] <= 8.967185) {
              return 0.002397;
            } else {
              return 0.053138;
            }
          } else {
            if (f[1] <= 2.320849) {
              return 0.040457;
            } else {
              return 0.060057;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[2] <= 0.229380) {
            if (f[2] <= 0.091239) {
              return -0.039546;
            } else {
              return -0.070566;
            }
          } else {
            return -0.037959;
          }
        } else {
          if (f[7] <= 0.000376) {
            return 0.010963;
          } else {
            return -0.054188;
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[1] <= -5.237910) {
          if (f[3] <= 0.001453) {
            if (f[7] <= -0.000600) {
              return 0.058886;
            } else {
              return 0.060669;
            }
          } else {
            return 0.003211;
          }
        } else {
          if (f[9] <= 0.000058) {
            return -0.068408;
          } else {
            if (f[8] <= -0.000543) {
              return -0.011956;
            } else {
              return 0.017816;
            }
          }
        }
      } else {
        if (f[3] <= 0.001461) {
          if (f[15] <= -0.000303) {
            return -0.035556;
          } else {
            if (f[15] <= -0.000183) {
              return -0.065846;
            } else {
              return -0.039848;
            }
          }
        } else {
          if (f[7] <= 0.000354) {
            return 0.013199;
          } else {
            return -0.049179;
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[2] <= 0.567770) {
          if (f[9] <= 0.000099) {
            if (f[3] <= 0.001136) {
              return -0.044876;
            } else {
              return 0.019643;
            }
          } else {
            if (f[19] <= 0.000000) {
              return 0.069600;
            } else {
              return 0.058393;
            }
          }
        } else {
          if (f[9] <= 0.000193) {
            if (f[0] <= 69.919780) {
              return -0.001571;
            } else {
              return -0.094540;
            }
          } else {
            if (f[0] <= 74.648808) {
              return 0.062960;
            } else {
              return 0.006312;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.688336) {
            if (f[9] <= 0.000152) {
              return -0.050708;
            } else {
              return -0.012880;
            }
          } else {
            return 0.017592;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.041199;
          } else {
            return -0.066955;
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[2] <= 0.091239) {
          if (f[6] <= -0.000197) {
            if (f[7] <= -0.000543) {
              return 0.059270;
            } else {
              return 0.065711;
            }
          } else {
            return 0.002958;
          }
        } else {
          if (f[15] <= -0.000316) {
            return -0.039625;
          } else {
            if (f[3] <= 0.003751) {
              return 0.007883;
            } else {
              return 0.061796;
            }
          }
        }
      } else {
        if (f[16] <= -0.000604) {
          if (f[6] <= -0.000211) {
            return -0.036344;
          } else {
            return 0.026483;
          }
        } else {
          if (f[16] <= 0.000518) {
            if (f[21] <= 0.547079) {
              return -0.076186;
            } else {
              return -0.055501;
            }
          } else {
            return -0.009365;
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[16] <= -0.000617) {
          if (f[6] <= -0.000218) {
            return 0.018930;
          } else {
            if (f[1] <= -4.881867) {
              return 0.058078;
            } else {
              return 0.061190;
            }
          }
        } else {
          if (f[15] <= -0.000315) {
            return -0.031848;
          } else {
            if (f[3] <= 0.003702) {
              return 0.007737;
            } else {
              return 0.060824;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[3] <= 0.001461) {
            if (f[12] <= 0.000059) {
              return -0.025268;
            } else {
              return -0.060400;
            }
          } else {
            if (f[21] <= 0.584251) {
              return -0.048984;
            } else {
              return 0.044815;
            }
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.038649;
          } else {
            return -0.065413;
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[9] <= 0.000135) {
          if (f[1] <= -1.740223) {
            if (f[7] <= -0.000421) {
              return 0.023129;
            } else {
              return -0.027687;
            }
          } else {
            if (f[12] <= 0.000054) {
              return 0.001563;
            } else {
              return 0.055837;
            }
          }
        } else {
          if (f[9] <= 0.000190) {
            if (f[1] <= 2.932089) {
              return 0.001492;
            } else {
              return -0.082764;
            }
          } else {
            if (f[0] <= 74.648808) {
              return 0.054896;
            } else {
              return 0.004141;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[21] <= 0.668969) {
            if (f[15] <= -0.000303) {
              return -0.019024;
            } else {
              return -0.053451;
            }
          } else {
            return 0.013274;
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.037504;
          } else {
            return -0.064485;
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[8] <= -0.001060) {
          if (f[3] <= 0.001428) {
            if (f[7] <= -0.000575) {
              return 0.057962;
            } else {
              return 0.061769;
            }
          } else {
            if (f[9] <= 0.000062) {
              return -0.044212;
            } else {
              return 0.048935;
            }
          }
        } else {
          if (f[9] <= 0.000058) {
            return -0.048124;
          } else {
            if (f[8] <= -0.000543) {
              return -0.024142;
            } else {
              return 0.018012;
            }
          }
        }
      } else {
        if (f[3] <= 0.001287) {
          if (f[12] <= 0.000061) {
            return -0.067933;
          } else {
            return -0.041596;
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[16] <= 0.000518) {
              return -0.023066;
            } else {
              return 0.038299;
            }
          } else {
            return -0.063426;
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[9] <= 0.000135) {
          if (f[1] <= -1.740223) {
            if (f[7] <= -0.000421) {
              return 0.022051;
            } else {
              return -0.025742;
            }
          } else {
            if (f[10] <= -0.000056) {
              return 0.057804;
            } else {
              return 0.010281;
            }
          }
        } else {
          if (f[9] <= 0.000193) {
            if (f[1] <= 2.479431) {
              return 0.017705;
            } else {
              return -0.064315;
            }
          } else {
            if (f[16] <= 0.000973) {
              return -0.017383;
            } else {
              return 0.042227;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[3] <= 0.001461) {
            if (f[14] <= -0.000185) {
              return -0.059800;
            } else {
              return -0.024606;
            }
          } else {
            if (f[21] <= 0.584251) {
              return -0.044545;
            } else {
              return 0.043665;
            }
          }
        } else {
          if (f[21] <= 0.612211) {
            return -0.035456;
          } else {
            return -0.063247;
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[19] <= 0.000000) {
        if (f[2] <= 0.091239) {
          if (f[9] <= 0.000065) {
            if (f[9] <= 0.000060) {
              return 0.071557;
            } else {
              return 0.022293;
            }
          } else {
            return -0.027793;
          }
        } else {
          if (f[3] <= 0.003751) {
            if (f[0] <= 71.365639) {
              return -0.002294;
            } else {
              return -0.027142;
            }
          } else {
            if (f[3] <= 0.004237) {
              return 0.054805;
            } else {
              return 0.008001;
            }
          }
        }
      } else {
        if (f[9] <= 0.000111) {
          return 0.013321;
        } else {
          return 0.053756;
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[3] <= 0.003949) {
          if (f[9] <= 0.000135) {
            if (f[1] <= -1.740223) {
              return 0.005226;
            } else {
              return 0.042207;
            }
          } else {
            if (f[6] <= 0.000221) {
              return -0.035182;
            } else {
              return 0.013254;
            }
          }
        } else {
          return 0.060889;
        }
      } else {
        if (f[3] <= 0.001287) {
          if (f[21] <= 0.668969) {
            return -0.060996;
          } else {
            return -0.044549;
          }
        } else {
          if (f[8] <= 0.001091) {
            if (f[16] <= 0.000518) {
              return -0.025603;
            } else {
              return 0.036698;
            }
          } else {
            return -0.060564;
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[21] <= 0.494079) {
        if (f[2] <= 0.091239) {
          if (f[0] <= 7.820535) {
            if (f[8] <= -0.000835) {
              return 0.058423;
            } else {
              return 0.063810;
            }
          } else {
            return -0.001461;
          }
        } else {
          if (f[15] <= -0.000316) {
            return -0.037921;
          } else {
            if (f[3] <= 0.003751) {
              return 0.005713;
            } else {
              return 0.059369;
            }
          }
        }
      } else {
        if (f[16] <= -0.000603) {
          if (f[3] <= 0.001459) {
            return -0.025505;
          } else {
            return 0.027491;
          }
        } else {
          if (f[16] <= 0.000518) {
            if (f[14] <= -0.000176) {
              return -0.071154;
            } else {
              return -0.045151;
            }
          } else {
            return -0.006032;
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[21] <= 0.471348) {
        if (f[2] <= 0.091239) {
          if (f[6] <= -0.000192) {
            if (f[8] <= -0.000835) {
              return 0.057670;
            } else {
              return 0.063628;
            }
          } else {
            return 0.002051;
          }
        } else {
          if (f[15] <= -0.000316) {
            return -0.038301;
          } else {
            if (f[10] <= -0.000067) {
              return 0.054172;
            } else {
              return 0.005800;
            }
          }
        }
      } else {
        if (f[16] <= -0.000604) {
          if (f[6] <= -0.000211) {
            return -0.025999;
          } else {
            return 0.025676;
          }
        } else {
          if (f[16] <= 0.000686) {
            if (f[7] <= 0.000047) {
              return -0.039118;
            } else {
              return -0.065334;
            }
          } else {
            if (f[8] <= 0.000994) {
              return 0.026369;
            } else {
              return -0.033629;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[16] <= -0.000617) {
        if (f[9] <= 0.000061) {
          return -0.000834;
        } else {
          if (f[6] <= -0.000217) {
            return 0.036462;
          } else {
            return 0.067417;
          }
        }
      } else {
        if (f[19] <= 0.000000) {
          if (f[3] <= 0.003751) {
            if (f[0] <= 71.365639) {
              return -0.003138;
            } else {
              return -0.026520;
            }
          } else {
            if (f[3] <= 0.004237) {
              return 0.052629;
            } else {
              return 0.006706;
            }
          }
        } else {
          if (f[9] <= 0.000111) {
            return 0.012868;
          } else {
            return 0.053031;
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[16] <= -0.000617) {
        if (f[9] <= 0.000061) {
          return -0.000792;
        } else {
          if (f[6] <= -0.000217) {
            return 0.035292;
          } else {
            return 0.066641;
          }
        }
      } else {
        if (f[9] <= 0.000058) {
          return -0.040062;
        } else {
          if (f[9] <= 0.000060) {
            if (f[1] <= -3.074574) {
              return 0.043593;
            } else {
              return -0.004629;
            }
          } else {
            if (f[1] <= -3.126162) {
              return -0.037754;
            } else {
              return 0.001963;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[3] <= 0.003949) {
          if (f[2] <= 0.595710) {
            if (f[1] <= -1.740223) {
              return 0.003924;
            } else {
              return 0.039866;
            }
          } else {
            if (f[2] <= 0.712574) {
              return -0.051929;
            } else {
              return 0.004441;
            }
          }
        } else {
          return 0.059866;
        }
      } else {
        if (f[14] <= -0.000191) {
          return 0.013171;
        } else {
          if (f[3] <= 0.001287) {
            if (f[14] <= -0.000176) {
              return -0.060845;
            } else {
              return -0.058081;
            }
          } else {
            if (f[8] <= 0.001091) {
              return -0.009954;
            } else {
              return -0.069456;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[16] <= -0.000617) {
        if (f[9] <= 0.000061) {
          return -0.000813;
        } else {
          if (f[16] <= -0.000623) {
            if (f[14] <= -0.000189) {
              return 0.015076;
            } else {
              return 0.057897;
            }
          } else {
            return 0.068715;
          }
        }
      } else {
        if (f[19] <= 0.000000) {
          if (f[3] <= 0.001136) {
            if (f[16] <= -0.000160) {
              return -0.058427;
            } else {
              return 0.012035;
            }
          } else {
            if (f[3] <= 0.001252) {
              return 0.035795;
            } else {
              return -0.005396;
            }
          }
        } else {
          if (f[9] <= 0.000111) {
            return 0.011649;
          } else {
            return 0.052427;
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[9] <= 0.000058) {
        return -0.038079;
      } else {
        if (f[9] <= 0.000060) {
          if (f[1] <= -3.074574) {
            if (f[8] <= -0.001215) {
              return 0.011003;
            } else {
              return 0.055031;
            }
          } else {
            if (f[1] <= -2.013094) {
              return -0.048059;
            } else {
              return 0.020156;
            }
          }
        } else {
          if (f[9] <= 0.000062) {
            if (f[8] <= -0.001407) {
              return 0.033620;
            } else {
              return -0.036121;
            }
          } else {
            if (f[0] <= 12.656291) {
              return 0.043309;
            } else {
              return -0.004258;
            }
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[3] <= 0.003949) {
          if (f[2] <= 0.595710) {
            if (f[1] <= -1.740223) {
              return 0.003587;
            } else {
              return 0.038596;
            }
          } else {
            if (f[14] <= -0.000180) {
              return -0.048939;
            } else {
              return 0.004646;
            }
          }
        } else {
          return 0.059414;
        }
      } else {
        if (f[14] <= -0.000192) {
          return 0.018291;
        } else {
          if (f[3] <= 0.001287) {
            if (f[14] <= -0.000176) {
              return -0.060244;
            } else {
              return -0.057609;
            }
          } else {
            if (f[8] <= 0.001091) {
              return -0.010413;
            } else {
              return -0.068050;
            }
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[1] <= -5.237910) {
          if (f[3] <= 0.001453) {
            if (f[2] <= 0.099086) {
              return 0.056538;
            } else {
              return 0.059671;
            }
          } else {
            return -0.008174;
          }
        } else {
          if (f[7] <= -0.000566) {
            return -0.058578;
          } else {
            if (f[16] <= -0.000610) {
              return 0.042911;
            } else {
              return 0.002262;
            }
          }
        }
      } else {
        if (f[14] <= -0.000192) {
          return 0.017384;
        } else {
          if (f[3] <= 0.001287) {
            if (f[14] <= -0.000176) {
              return -0.059651;
            } else {
              return -0.057186;
            }
          } else {
            if (f[8] <= 0.001091) {
              return -0.009924;
            } else {
              return -0.066952;
            }
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[3] <= 0.003949) {
          if (f[2] <= 0.567770) {
            if (f[9] <= 0.000099) {
              return 0.006826;
            } else {
              return 0.062308;
            }
          } else {
            if (f[14] <= -0.000180) {
              return -0.044751;
            } else {
              return 0.003815;
            }
          }
        } else {
          return 0.058867;
        }
      } else {
        if (f[9] <= 0.000135) {
          if (f[8] <= -0.000372) {
            if (f[8] <= -0.000776) {
              return -0.044590;
            } else {
              return 0.020565;
            }
          } else {
            if (f[3] <= 0.001178) {
              return -0.041576;
            } else {
              return -0.063906;
            }
          }
        } else {
          if (f[7] <= 0.000354) {
            return 0.046411;
          } else {
            if (f[8] <= 0.001043) {
              return -0.005743;
            } else {
              return -0.065516;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[21] <= 0.471348) {
        if (f[2] <= 0.091239) {
          if (f[0] <= 9.400866) {
            if (f[8] <= -0.000811) {
              return 0.056911;
            } else {
              return 0.061719;
            }
          } else {
            return -0.004122;
          }
        } else {
          if (f[15] <= -0.000316) {
            return -0.039019;
          } else {
            if (f[10] <= -0.000067) {
              return 0.053123;
            } else {
              return 0.004293;
            }
          }
        }
      } else {
        if (f[3] <= 0.001437) {
          if (f[15] <= -0.000298) {
            if (f[12] <= 0.000059) {
              return 0.007400;
            } else {
              return -0.043020;
            }
          } else {
            if (f[12] <= 0.000060) {
              return -0.064798;
            } else {
              return -0.032170;
            }
          }
        } else {
          if (f[12] <= 0.000060) {
            if (f[3] <= 0.003073) {
              return -0.008863;
            } else {
              return -0.053433;
            }
          } else {
            if (f[0] <= 70.466163) {
              return 0.037910;
            } else {
              return -0.013838;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[8] <= -0.001060) {
          if (f[1] <= -5.604527) {
            return -0.034815;
          } else {
            if (f[1] <= -5.237910) {
              return 0.051284;
            } else {
              return 0.016929;
            }
          }
        } else {
          if (f[8] <= -0.000543) {
            if (f[3] <= 0.001456) {
              return -0.042303;
            } else {
              return 0.047809;
            }
          } else {
            if (f[16] <= -0.000572) {
              return 0.031845;
            } else {
              return -0.000518;
            }
          }
        }
      } else {
        if (f[14] <= -0.000174) {
          if (f[3] <= 0.001461) {
            if (f[3] <= 0.001393) {
              return -0.013532;
            } else {
              return -0.067379;
            }
          } else {
            if (f[21] <= 0.584251) {
              return -0.035414;
            } else {
              return 0.042395;
            }
          }
        } else {
          if (f[12] <= 0.000061) {
            if (f[3] <= 0.001403) {
              return -0.056768;
            } else {
              return -0.063238;
            }
          } else {
            return -0.019950;
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[21] <= 0.471348) {
        if (f[2] <= 0.091239) {
          if (f[0] <= 9.400866) {
            if (f[8] <= -0.000795) {
              return 0.057111;
            } else {
              return 0.061110;
            }
          } else {
            return -0.003588;
          }
        } else {
          if (f[15] <= -0.000316) {
            return -0.036680;
          } else {
            if (f[10] <= -0.000067) {
              return 0.052000;
            } else {
              return 0.003860;
            }
          }
        }
      } else {
        if (f[3] <= 0.001287) {
          if (f[15] <= -0.000294) {
            return -0.024838;
          } else {
            return -0.066102;
          }
        } else {
          if (f[16] <= -0.000603) {
            if (f[3] <= 0.001459) {
              return -0.016044;
            } else {
              return 0.027600;
            }
          } else {
            if (f[16] <= 0.000686) {
              return -0.042804;
            } else {
              return 0.002420;
            }
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[21] <= 0.502236) {
        if (f[9] <= 0.000058) {
          return -0.038137;
        } else {
          if (f[3] <= 0.001428) {
            if (f[0] <= 12.656291) {
              return 0.036532;
            } else {
              return -0.004728;
            }
          } else {
            if (f[3] <= 0.001440) {
              return -0.065490;
            } else {
              return 0.005309;
            }
          }
        }
      } else {
        if (f[9] <= 0.000135) {
          if (f[8] <= -0.000372) {
            if (f[8] <= -0.000776) {
              return -0.042779;
            } else {
              return 0.022712;
            }
          } else {
            if (f[3] <= 0.001178) {
              return -0.038439;
            } else {
              return -0.061882;
            }
          }
        } else {
          if (f[7] <= 0.000354) {
            return 0.045103;
          } else {
            if (f[8] <= 0.001026) {
              return -0.008074;
            } else {
              return -0.055629;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[21] <= 0.471348) {
        if (f[21] <= 0.080897) {
          return -0.025516;
        } else {
          if (f[15] <= 0.001062) {
            if (f[15] <= 0.000512) {
              return 0.009512;
            } else {
              return -0.062151;
            }
          } else {
            if (f[16] <= 0.001282) {
              return 0.072067;
            } else {
              return 0.020468;
            }
          }
        }
      } else {
        if (f[12] <= 0.000058) {
          if (f[12] <= 0.000056) {
            if (f[15] <= -0.000289) {
              return -0.005640;
            } else {
              return -0.052069;
            }
          } else {
            return -0.056579;
          }
        } else {
          if (f[16] <= -0.000595) {
            if (f[6] <= -0.000211) {
              return -0.010935;
            } else {
              return 0.035849;
            }
          } else {
            if (f[16] <= 0.000696) {
              return -0.047089;
            } else {
              return 0.008038;
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
// Main model trees: 500, Meta trees: 200
function predict_CRASHk(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[0] <= 36.465510) {
            if (f[15] <= -0.001807) {
              if (f[7] <= -0.001596) {
                if (f[9] <= 0.000321) {
                  return 0.032073;
                } else {
                  return -0.017245;
                }
              } else {
                return -0.016963;
              }
            } else {
              if (f[14] <= -0.001281) {
                return 0.044392;
              } else {
                if (f[16] <= -0.001993) {
                  return 0.029722;
                } else {
                  return 0.004899;
                }
              }
            }
          } else {
            if (f[7] <= -0.000500) {
              return -0.030597;
            } else {
              return 0.013377;
            }
          }
        } else {
          return 0.038880;
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[14] <= 0.000161) {
            if (f[2] <= 0.749274) {
              if (f[10] <= 0.000056) {
                return 0.019715;
              } else {
                return -0.008535;
              }
            } else {
              return 0.058638;
            }
          } else {
            if (f[16] <= -0.000116) {
              if (f[15] <= 0.000298) {
                if (f[16] <= -0.000320) {
                  return 0.012429;
                } else {
                  return -0.033124;
                }
              } else {
                return -0.044084;
              }
            } else {
              if (f[16] <= 0.000104) {
                if (f[19] <= 0.000000) {
                  return 0.050555;
                } else {
                  return -0.014882;
                }
              } else {
                if (f[9] <= 0.000060) {
                  return -0.017501;
                } else {
                  return -0.005706;
                }
              }
            }
          }
        } else {
          if (f[6] <= 0.000192) {
            if (f[16] <= -0.000308) {
              return -0.025997;
            } else {
              if (f[16] <= -0.000019) {
                if (f[16] <= -0.000207) {
                  return 0.007714;
                } else {
                  return 0.048705;
                }
              } else {
                if (f[7] <= -0.000019) {
                  return -0.029520;
                } else {
                  return -0.002517;
                }
              }
            }
          } else {
            if (f[7] <= 0.000578) {
              if (f[16] <= 0.000603) {
                if (f[7] <= 0.000470) {
                  return 0.022793;
                } else {
                  return 0.054577;
                }
              } else {
                if (f[2] <= 0.903857) {
                  return 0.022103;
                } else {
                  return -0.009555;
                }
              }
            } else {
              if (f[16] <= 0.000603) {
                return -0.019479;
              } else {
                if (f[0] <= 100.000000) {
                  return 0.035375;
                } else {
                  return -0.001215;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.057681;
        } else {
          if (f[16] <= -0.002960) {
            return 0.038174;
          } else {
            if (f[0] <= 15.396958) {
              return -0.031087;
            } else {
              if (f[9] <= 0.000230) {
                if (f[16] <= -0.001720) {
                  return -0.035414;
                } else {
                  return 0.006425;
                }
              } else {
                if (f[14] <= 0.000178) {
                  return 0.010707;
                } else {
                  return 0.048326;
                }
              }
            }
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.026192;
          } else {
            return -0.042816;
          }
        } else {
          if (f[14] <= 0.000161) {
            if (f[16] <= -0.000263) {
              if (f[3] <= 0.001329) {
                return -0.032315;
              } else {
                return 0.004594;
              }
            } else {
              if (f[9] <= 0.000087) {
                if (f[2] <= 0.749274) {
                  return -0.018377;
                } else {
                  return 0.049332;
                }
              } else {
                if (f[3] <= 0.001190) {
                  return 0.024338;
                } else {
                  return 0.059081;
                }
              }
            }
          } else {
            if (f[20] <= 0.000000) {
              if (f[3] <= 0.001495) {
                if (f[3] <= 0.000888) {
                  return 0.008360;
                } else {
                  return -0.013419;
                }
              } else {
                if (f[15] <= 0.000301) {
                  return 0.027869;
                } else {
                  return -0.012395;
                }
              }
            } else {
              if (f[9] <= 0.000136) {
                if (f[3] <= 0.000939) {
                  return -0.017045;
                } else {
                  return 0.011225;
                }
              } else {
                if (f[16] <= 0.000600) {
                  return 0.000520;
                } else {
                  return -0.039062;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[0] <= 36.465510) {
            if (f[15] <= -0.001807) {
              if (f[7] <= -0.001596) {
                if (f[9] <= 0.000321) {
                  return 0.030835;
                } else {
                  return -0.016949;
                }
              } else {
                if (f[0] <= 24.430409) {
                  return -0.034993;
                } else {
                  return 0.003497;
                }
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[10] <= 0.000056) {
                  return 0.028257;
                } else {
                  return 0.057492;
                }
              } else {
                if (f[16] <= -0.001993) {
                  return 0.028287;
                } else {
                  return 0.004561;
                }
              }
            }
          } else {
            if (f[7] <= -0.000500) {
              return -0.029880;
            } else {
              if (f[10] <= 0.000060) {
                return -0.001271;
              } else {
                return 0.033198;
              }
            }
          }
        } else {
          if (f[9] <= 0.000138) {
            return 0.056082;
          } else {
            if (f[0] <= 39.773205) {
              return 0.046900;
            } else {
              return 0.000477;
            }
          }
        }
      } else {
        if (f[8] <= -0.001440) {
          if (f[9] <= 0.000198) {
            return -0.009444;
          } else {
            return -0.048498;
          }
        } else {
          if (f[16] <= -0.000463) {
            return -0.033046;
          } else {
            if (f[14] <= 0.000161) {
              if (f[16] <= -0.000263) {
                return -0.017639;
              } else {
                if (f[9] <= 0.000087) {
                  return 0.006367;
                } else {
                  return 0.039097;
                }
              }
            } else {
              if (f[15] <= 0.000324) {
                if (f[2] <= 0.961597) {
                  return -0.002799;
                } else {
                  return -0.026691;
                }
              } else {
                return 0.024009;
              }
            }
          }
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[16] <= -0.002960) {
            return 0.036732;
          } else {
            if (f[9] <= 0.000319) {
              if (f[9] <= 0.000230) {
                if (f[16] <= -0.001720) {
                  return -0.034477;
                } else {
                  return 0.004791;
                }
              } else {
                if (f[14] <= 0.000178) {
                  return 0.009475;
                } else {
                  return 0.050461;
                }
              }
            } else {
              return -0.022277;
            }
          }
        } else {
          if (f[1] <= -0.827108) {
            if (f[1] <= -1.389915) {
              return 0.055802;
            } else {
              return -0.017174;
            }
          } else {
            return 0.055514;
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.024599;
          } else {
            return -0.040840;
          }
        } else {
          if (f[1] <= 2.235690) {
            if (f[20] <= 0.000000) {
              if (f[14] <= 0.000161) {
                if (f[8] <= -0.000508) {
                  return 0.045859;
                } else {
                  return 0.008428;
                }
              } else {
                if (f[3] <= 0.001470) {
                  return -0.010198;
                } else {
                  return 0.006606;
                }
              }
            } else {
              if (f[1] <= 0.513910) {
                if (f[15] <= 0.000310) {
                  return -0.013940;
                } else {
                  return 0.034818;
                }
              } else {
                if (f[3] <= 0.001464) {
                  return 0.009016;
                } else {
                  return 0.058391;
                }
              }
            }
          } else {
            return -0.036824;
          }
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[0] <= 36.465510) {
            if (f[15] <= -0.001807) {
              if (f[8] <= -0.002060) {
                return 0.010139;
              } else {
                if (f[0] <= 23.329537) {
                  return -0.030599;
                } else {
                  return -0.001233;
                }
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[10] <= 0.000056) {
                  return 0.027368;
                } else {
                  return 0.055762;
                }
              } else {
                if (f[16] <= -0.001993) {
                  return 0.026906;
                } else {
                  return 0.004298;
                }
              }
            }
          } else {
            if (f[8] <= -0.000587) {
              return -0.024283;
            } else {
              return 0.008900;
            }
          }
        } else {
          if (f[1] <= -0.827108) {
            if (f[1] <= -1.389915) {
              return 0.054353;
            } else {
              return -0.016658;
            }
          } else {
            return 0.054091;
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.023886;
          } else {
            return -0.039701;
          }
        } else {
          if (f[1] <= 2.235690) {
            if (f[20] <= 0.000000) {
              if (f[14] <= 0.000161) {
                if (f[8] <= -0.000508) {
                  return 0.044562;
                } else {
                  return 0.008177;
                }
              } else {
                if (f[3] <= 0.001470) {
                  return -0.009894;
                } else {
                  return 0.006408;
                }
              }
            } else {
              if (f[1] <= 0.513910) {
                if (f[15] <= 0.000310) {
                  return -0.013524;
                } else {
                  return 0.033792;
                }
              } else {
                if (f[3] <= 0.001464) {
                  return 0.008747;
                } else {
                  return 0.056744;
                }
              }
            }
          } else {
            return -0.035742;
          }
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[12] <= 0.000073) {
        if (f[20] <= 0.000000) {
          if (f[6] <= 0.000195) {
            if (f[19] <= 0.000000) {
              if (f[3] <= 0.000829) {
                if (f[2] <= 0.903024) {
                  return 0.058155;
                } else {
                  return 0.000164;
                }
              } else {
                if (f[7] <= 0.000393) {
                  return -0.000033;
                } else {
                  return 0.033767;
                }
              }
            } else {
              if (f[14] <= 0.000172) {
                if (f[6] <= -0.000108) {
                  return -0.010250;
                } else {
                  return 0.024186;
                }
              } else {
                if (f[6] <= 0.000125) {
                  return -0.033184;
                } else {
                  return -0.006718;
                }
              }
            }
          } else {
            if (f[14] <= 0.000174) {
              if (f[8] <= 0.000621) {
                return -0.039153;
              } else {
                if (f[7] <= 0.000539) {
                  return -0.004457;
                } else {
                  return -0.032627;
                }
              }
            } else {
              if (f[3] <= 0.001440) {
                if (f[0] <= 100.000000) {
                  return -0.006444;
                } else {
                  return 0.039446;
                }
              } else {
                if (f[7] <= 0.000399) {
                  return -0.001286;
                } else {
                  return -0.031952;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[7] <= 0.000580) {
              if (f[7] <= 0.000474) {
                if (f[8] <= 0.000725) {
                  return 0.032925;
                } else {
                  return -0.018576;
                }
              } else {
                return 0.057176;
              }
            } else {
              return -0.026851;
            }
          } else {
            if (f[6] <= 0.000219) {
              if (f[8] <= 0.000907) {
                if (f[8] <= 0.000529) {
                  return 0.000260;
                } else {
                  return 0.021679;
                }
              } else {
                if (f[3] <= 0.001445) {
                  return -0.022497;
                } else {
                  return 0.032856;
                }
              }
            } else {
              return 0.032619;
            }
          }
        }
      } else {
        if (f[6] <= -0.000463) {
          if (f[2] <= 0.134736) {
            if (f[7] <= -0.000928) {
              if (f[7] <= -0.001489) {
                return 0.012655;
              } else {
                return 0.044958;
              }
            } else {
              return -0.000579;
            }
          } else {
            return -0.015209;
          }
        } else {
          if (f[0] <= 65.014015) {
            return 0.042762;
          } else {
            return 0.018072;
          }
        }
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[12] <= 0.000073) {
        if (f[1] <= 2.235690) {
          if (f[20] <= 0.000000) {
            if (f[6] <= 0.000195) {
              if (f[1] <= 1.283937) {
                if (f[19] <= 0.000000) {
                  return 0.001265;
                } else {
                  return -0.014100;
                }
              } else {
                return 0.046332;
              }
            } else {
              if (f[14] <= 0.000174) {
                if (f[8] <= 0.000621) {
                  return -0.038035;
                } else {
                  return -0.018998;
                }
              } else {
                if (f[6] <= 0.000201) {
                  return -0.021582;
                } else {
                  return -0.000322;
                }
              }
            }
          } else {
            if (f[6] <= 0.000192) {
              if (f[15] <= -0.001053) {
                if (f[15] <= -0.001424) {
                  return -0.005004;
                } else {
                  return 0.056742;
                }
              } else {
                if (f[15] <= -0.000604) {
                  return -0.026778;
                } else {
                  return -0.000074;
                }
              }
            } else {
              if (f[3] <= 0.001464) {
                if (f[3] <= 0.001418) {
                  return 0.022554;
                } else {
                  return -0.004205;
                }
              } else {
                return 0.054575;
              }
            }
          }
        } else {
          return -0.034677;
        }
      } else {
        if (f[6] <= -0.000463) {
          if (f[7] <= -0.000826) {
            if (f[3] <= 0.003077) {
              if (f[6] <= -0.001332) {
                return 0.011827;
              } else {
                return 0.039782;
              }
            } else {
              return -0.006021;
            }
          } else {
            return -0.007361;
          }
        } else {
          if (f[0] <= 65.014015) {
            return 0.041583;
          } else {
            return 0.017546;
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.052361;
        } else {
          if (f[16] <= -0.002960) {
            return 0.035019;
          } else {
            if (f[0] <= 15.396958) {
              return -0.030239;
            } else {
              if (f[9] <= 0.000230) {
                if (f[16] <= -0.001720) {
                  return -0.033757;
                } else {
                  return 0.005543;
                }
              } else {
                if (f[14] <= 0.000178) {
                  return 0.009383;
                } else {
                  return 0.044872;
                }
              }
            }
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.023165;
          } else {
            return -0.038655;
          }
        } else {
          if (f[1] <= 2.235690) {
            if (f[16] <= -0.000207) {
              if (f[14] <= 0.000183) {
                if (f[9] <= 0.000131) {
                  return 0.003799;
                } else {
                  return -0.021066;
                }
              } else {
                return -0.036292;
              }
            } else {
              if (f[16] <= 0.000474) {
                if (f[0] <= 74.254368) {
                  return 0.006498;
                } else {
                  return 0.044103;
                }
              } else {
                if (f[20] <= 0.000000) {
                  return -0.007397;
                } else {
                  return 0.006413;
                }
              }
            }
          } else {
            return -0.033699;
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[16] <= -0.002960) {
            return 0.034063;
          } else {
            if (f[12] <= 0.000063) {
              if (f[9] <= 0.000319) {
                if (f[8] <= -0.001992) {
                  return 0.028246;
                } else {
                  return -0.001183;
                }
              } else {
                return -0.027282;
              }
            } else {
              if (f[1] <= -2.126516) {
                if (f[7] <= -0.001052) {
                  return 0.007912;
                } else {
                  return 0.049936;
                }
              } else {
                if (f[10] <= 0.000067) {
                  return 0.011479;
                } else {
                  return -0.021495;
                }
              }
            }
          }
        } else {
          if (f[1] <= -0.827108) {
            if (f[1] <= -1.389915) {
              return 0.052401;
            } else {
              return -0.016634;
            }
          } else {
            return 0.051926;
          }
        }
      } else {
        if (f[1] <= -3.080495) {
          return -0.033579;
        } else {
          if (f[1] <= 2.235690) {
            if (f[16] <= -0.000207) {
              if (f[14] <= 0.000183) {
                if (f[9] <= 0.000131) {
                  return 0.004013;
                } else {
                  return -0.022952;
                }
              } else {
                return -0.035274;
              }
            } else {
              if (f[16] <= 0.000474) {
                if (f[16] <= 0.000320) {
                  return 0.007278;
                } else {
                  return 0.041388;
                }
              } else {
                if (f[8] <= 0.000450) {
                  return -0.007702;
                } else {
                  return 0.002730;
                }
              }
            }
          } else {
            return -0.032767;
          }
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[16] <= -0.000511) {
        if (f[16] <= -0.000677) {
          if (f[0] <= 36.465510) {
            if (f[15] <= -0.001807) {
              if (f[7] <= -0.001596) {
                if (f[0] <= 15.822504) {
                  return -0.017534;
                } else {
                  return 0.028818;
                }
              } else {
                if (f[0] <= 24.430409) {
                  return -0.033664;
                } else {
                  return 0.003035;
                }
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[13] <= 0.000056) {
                  return 0.025480;
                } else {
                  return 0.053707;
                }
              } else {
                if (f[16] <= -0.001993) {
                  return 0.025264;
                } else {
                  return 0.003737;
                }
              }
            }
          } else {
            if (f[7] <= -0.000500) {
              return -0.028960;
            } else {
              if (f[13] <= 0.000060) {
                return -0.001486;
              } else {
                return 0.031681;
              }
            }
          }
        } else {
          if (f[13] <= 0.000060) {
            if (f[13] <= 0.000054) {
              return 0.028842;
            } else {
              return 0.052476;
            }
          } else {
            return 0.009066;
          }
        }
      } else {
        if (f[3] <= 0.004528) {
          if (f[16] <= -0.000207) {
            if (f[9] <= 0.000132) {
              if (f[0] <= 47.674470) {
                if (f[8] <= -0.000515) {
                  return -0.019887;
                } else {
                  return 0.060276;
                }
              } else {
                if (f[14] <= 0.000182) {
                  return -0.008924;
                } else {
                  return -0.036967;
                }
              }
            } else {
              return -0.037043;
            }
          } else {
            if (f[16] <= 0.000474) {
              if (f[0] <= 74.254368) {
                if (f[9] <= 0.000085) {
                  return -0.033057;
                } else {
                  return 0.010667;
                }
              } else {
                if (f[0] <= 89.635576) {
                  return 0.056406;
                } else {
                  return 0.009735;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[2] <= 0.705150) {
                  return 0.006136;
                } else {
                  return -0.010886;
                }
              } else {
                if (f[3] <= 0.001656) {
                  return 0.009647;
                } else {
                  return -0.019814;
                }
              }
            }
          }
        } else {
          return -0.032839;
        }
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.049623;
        } else {
          if (f[16] <= -0.002960) {
            return 0.032915;
          } else {
            if (f[0] <= 15.396958) {
              return -0.028900;
            } else {
              if (f[9] <= 0.000230) {
                if (f[16] <= -0.001720) {
                  return -0.033044;
                } else {
                  return 0.005066;
                }
              } else {
                if (f[14] <= 0.000178) {
                  return 0.008650;
                } else {
                  return 0.042991;
                }
              }
            }
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.021010;
          } else {
            return -0.036526;
          }
        } else {
          if (f[1] <= 2.235690) {
            if (f[12] <= 0.000069) {
              if (f[16] <= -0.000207) {
                if (f[14] <= 0.000183) {
                  return -0.004928;
                } else {
                  return -0.039491;
                }
              } else {
                if (f[16] <= 0.000474) {
                  return 0.009594;
                } else {
                  return -0.002877;
                }
              }
            } else {
              if (f[13] <= 0.000070) {
                if (f[6] <= -0.000096) {
                  return 0.010405;
                } else {
                  return 0.055773;
                }
              } else {
                return 0.001451;
              }
            }
          } else {
            return -0.032012;
          }
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.048626;
        } else {
          if (f[12] <= 0.000063) {
            if (f[12] <= 0.000062) {
              if (f[16] <= -0.002960) {
                return 0.040233;
              } else {
                if (f[9] <= 0.000319) {
                  return 0.004162;
                } else {
                  return -0.028901;
                }
              }
            } else {
              return -0.028464;
            }
          } else {
            if (f[14] <= -0.001011) {
              if (f[7] <= -0.000826) {
                if (f[15] <= -0.001872) {
                  return -0.007112;
                } else {
                  return 0.029654;
                }
              } else {
                return -0.024535;
              }
            } else {
              if (f[8] <= -0.000467) {
                if (f[2] <= 0.237140) {
                  return 0.022058;
                } else {
                  return 0.055369;
                }
              } else {
                return 0.000000;
              }
            }
          }
        }
      } else {
        if (f[8] <= -0.001440) {
          if (f[9] <= 0.000198) {
            return -0.007105;
          } else {
            return -0.042492;
          }
        } else {
          if (f[16] <= -0.000463) {
            return -0.029446;
          } else {
            if (f[14] <= 0.000161) {
              if (f[16] <= -0.000263) {
                return -0.016980;
              } else {
                if (f[9] <= 0.000087) {
                  return 0.004492;
                } else {
                  return 0.036099;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[9] <= 0.000060) {
                  return -0.014881;
                } else {
                  return -0.001703;
                }
              } else {
                if (f[9] <= 0.000060) {
                  return 0.019728;
                } else {
                  return 0.000472;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[16] <= -0.000511) {
        if (f[16] <= -0.000677) {
          if (f[0] <= 36.995709) {
            if (f[15] <= -0.001807) {
              if (f[8] <= -0.002060) {
                return 0.008995;
              } else {
                if (f[0] <= 23.329537) {
                  return -0.030002;
                } else {
                  return -0.001424;
                }
              }
            } else {
              if (f[2] <= 0.097671) {
                if (f[3] <= 0.001593) {
                  return -0.005413;
                } else {
                  return 0.036481;
                }
              } else {
                if (f[15] <= 0.000300) {
                  return -0.000656;
                } else {
                  return 0.016368;
                }
              }
            }
          } else {
            if (f[9] <= 0.000150) {
              return 0.015049;
            } else {
              return -0.034103;
            }
          }
        } else {
          if (f[0] <= 40.671462) {
            if (f[15] <= -0.000000) {
              return 0.051881;
            } else {
              return 0.036259;
            }
          } else {
            if (f[8] <= -0.000417) {
              return -0.003906;
            } else {
              return 0.037989;
            }
          }
        }
      } else {
        if (f[1] <= -3.080495) {
          return -0.030646;
        } else {
          if (f[16] <= -0.000463) {
            return -0.034235;
          } else {
            if (f[1] <= 2.235690) {
              if (f[20] <= 0.000000) {
                if (f[3] <= 0.001470) {
                  return -0.006214;
                } else {
                  return 0.008395;
                }
              } else {
                if (f[1] <= 0.513910) {
                  return -0.005526;
                } else {
                  return 0.011218;
                }
              }
            } else {
              return -0.031153;
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[16] <= 0.000320) {
          if (f[4] <= 0.000000) {
            if (f[3] <= 0.000909) {
              if (f[1] <= -0.234353) {
                return 0.019756;
              } else {
                return 0.056746;
              }
            } else {
              if (f[16] <= -0.002960) {
                return 0.031147;
              } else {
                if (f[9] <= 0.000319) {
                  return 0.004049;
                } else {
                  return -0.021805;
                }
              }
            }
          } else {
            if (f[10] <= 0.000053) {
              if (f[7] <= -0.000418) {
                return 0.001595;
              } else {
                return 0.032214;
              }
            } else {
              if (f[9] <= 0.000123) {
                if (f[1] <= 0.513910) {
                  return -0.038831;
                } else {
                  return -0.013223;
                }
              } else {
                return 0.004080;
              }
            }
          }
        } else {
          if (f[9] <= 0.000066) {
            return 0.011040;
          } else {
            return 0.054386;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001400) {
            if (f[10] <= 0.000065) {
              if (f[3] <= 0.000829) {
                return 0.003779;
              } else {
                if (f[8] <= 0.000735) {
                  return -0.022738;
                } else {
                  return -0.005494;
                }
              }
            } else {
              if (f[12] <= 0.000067) {
                return 0.036034;
              } else {
                return -0.019102;
              }
            }
          } else {
            if (f[3] <= 0.004314) {
              if (f[2] <= 0.892279) {
                if (f[9] <= 0.000154) {
                  return 0.019532;
                } else {
                  return -0.007556;
                }
              } else {
                if (f[2] <= 0.898366) {
                  return -0.026397;
                } else {
                  return 0.000400;
                }
              }
            } else {
              return -0.030598;
            }
          }
        } else {
          if (f[3] <= 0.001656) {
            if (f[8] <= 0.000752) {
              if (f[9] <= 0.000060) {
                return 0.050101;
              } else {
                if (f[8] <= 0.000030) {
                  return -0.016969;
                } else {
                  return 0.019326;
                }
              }
            } else {
              if (f[3] <= 0.001445) {
                if (f[9] <= 0.000060) {
                  return 0.011324;
                } else {
                  return -0.018297;
                }
              } else {
                if (f[8] <= 0.001173) {
                  return 0.054258;
                } else {
                  return 0.006958;
                }
              }
            }
          } else {
            if (f[3] <= 0.002193) {
              return -0.030466;
            } else {
              return 0.003999;
            }
          }
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.047235;
        } else {
          if (f[12] <= 0.000063) {
            if (f[12] <= 0.000062) {
              if (f[1] <= -0.858429) {
                if (f[14] <= 0.000178) {
                  return -0.004940;
                } else {
                  return 0.012131;
                }
              } else {
                if (f[1] <= -0.324454) {
                  return 0.036802;
                } else {
                  return -0.000121;
                }
              }
            } else {
              return -0.027683;
            }
          } else {
            if (f[14] <= -0.001011) {
              if (f[14] <= -0.001247) {
                if (f[15] <= -0.001872) {
                  return -0.011344;
                } else {
                  return 0.035477;
                }
              } else {
                return -0.017369;
              }
            } else {
              if (f[8] <= -0.000467) {
                if (f[6] <= -0.000147) {
                  return 0.021627;
                } else {
                  return 0.053802;
                }
              } else {
                return -0.000403;
              }
            }
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.018823;
          } else {
            return -0.034247;
          }
        } else {
          if (f[1] <= 2.228789) {
            if (f[6] <= 0.000219) {
              if (f[3] <= 0.002143) {
                if (f[9] <= 0.000165) {
                  return -0.001896;
                } else {
                  return -0.029324;
                }
              } else {
                if (f[15] <= 0.000298) {
                  return 0.027761;
                } else {
                  return -0.005105;
                }
              }
            } else {
              return 0.030621;
            }
          } else {
            return -0.025881;
          }
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.032431;
          } else {
            if (f[0] <= 54.888433) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000138) {
                  return 0.031489;
                } else {
                  return 0.003859;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return -0.005833;
                } else {
                  return -0.044384;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[10] <= 0.000065) {
                  return 0.051632;
                } else {
                  return 0.015966;
                }
              } else {
                return -0.018835;
              }
            }
          }
        } else {
          if (f[0] <= 89.635576) {
            return 0.053742;
          } else {
            return 0.008702;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[16] <= 0.000624) {
            if (f[6] <= 0.000213) {
              if (f[7] <= 0.000552) {
                if (f[8] <= -0.001426) {
                  return -0.034637;
                } else {
                  return -0.004907;
                }
              } else {
                if (f[2] <= 0.900712) {
                  return -0.014179;
                } else {
                  return -0.039822;
                }
              }
            } else {
              if (f[6] <= 0.000217) {
                return 0.050848;
              } else {
                return 0.005855;
              }
            }
          } else {
            return -0.029115;
          }
        } else {
          if (f[1] <= -0.388833) {
            return -0.023133;
          } else {
            if (f[1] <= 2.235690) {
              if (f[2] <= 0.623348) {
                return -0.013557;
              } else {
                if (f[1] <= 1.164459) {
                  return 0.028214;
                } else {
                  return 0.006540;
                }
              }
            } else {
              return -0.023008;
            }
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[6] <= 0.000201) {
          if (f[12] <= 0.000047) {
            return -0.008612;
          } else {
            if (f[12] <= 0.000049) {
              return 0.048432;
            } else {
              if (f[9] <= 0.000080) {
                return 0.038201;
              } else {
                if (f[3] <= 0.003884) {
                  return 0.014575;
                } else {
                  return -0.007086;
                }
              }
            }
          }
        } else {
          return -0.027575;
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[9] <= 0.000060) {
            if (f[2] <= 0.749274) {
              return 0.024520;
            } else {
              if (f[7] <= 0.000214) {
                return -0.040613;
              } else {
                if (f[2] <= 0.895763) {
                  return 0.013914;
                } else {
                  return -0.019603;
                }
              }
            }
          } else {
            if (f[19] <= 0.000000) {
              if (f[3] <= 0.000896) {
                if (f[16] <= 0.000591) {
                  return 0.050259;
                } else {
                  return -0.010828;
                }
              } else {
                if (f[16] <= 0.000624) {
                  return 0.000417;
                } else {
                  return -0.026112;
                }
              }
            } else {
              if (f[16] <= -0.000062) {
                if (f[15] <= 0.000295) {
                  return -0.013895;
                } else {
                  return -0.038497;
                }
              } else {
                return 0.008815;
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[7] <= 0.000580) {
              if (f[15] <= 0.000311) {
                if (f[2] <= 0.898657) {
                  return 0.006599;
                } else {
                  return 0.050519;
                }
              } else {
                return -0.007493;
              }
            } else {
              return -0.008195;
            }
          } else {
            if (f[16] <= 0.000629) {
              if (f[16] <= -0.000790) {
                if (f[3] <= 0.003267) {
                  return 0.033000;
                } else {
                  return -0.025707;
                }
              } else {
                if (f[15] <= 0.000318) {
                  return -0.006614;
                } else {
                  return 0.029582;
                }
              }
            } else {
              return 0.030994;
            }
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.031581;
          } else {
            if (f[0] <= 54.888433) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000138) {
                  return 0.030602;
                } else {
                  return 0.003634;
                }
              } else {
                if (f[9] <= 0.000131) {
                  return -0.004441;
                } else {
                  return -0.037780;
                }
              }
            } else {
              if (f[16] <= -0.000019) {
                if (f[14] <= 0.000172) {
                  return 0.038283;
                } else {
                  return 0.054199;
                }
              } else {
                if (f[2] <= 0.675744) {
                  return 0.025507;
                } else {
                  return -0.015586;
                }
              }
            }
          }
        } else {
          if (f[0] <= 89.635576) {
            return 0.052381;
          } else {
            return 0.008426;
          }
        }
      } else {
        if (f[3] <= 0.004528) {
          if (f[2] <= 0.961597) {
            if (f[1] <= 2.235690) {
              if (f[6] <= 0.000214) {
                if (f[3] <= 0.002328) {
                  return -0.004071;
                } else {
                  return 0.010767;
                }
              } else {
                if (f[2] <= 0.903857) {
                  return 0.054016;
                } else {
                  return 0.002104;
                }
              }
            } else {
              return -0.028750;
            }
          } else {
            return -0.027016;
          }
        } else {
          return -0.030655;
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[15] <= 0.000297) {
          if (f[3] <= 0.001167) {
            return 0.039399;
          } else {
            if (f[14] <= 0.000165) {
              if (f[1] <= -3.142626) {
                return -0.011962;
              } else {
                if (f[3] <= 0.002104) {
                  return 0.004313;
                } else {
                  return 0.046271;
                }
              }
            } else {
              if (f[15] <= 0.000290) {
                return 0.047228;
              } else {
                return 0.008063;
              }
            }
          }
        } else {
          return -0.020580;
        }
      } else {
        if (f[8] <= -0.001956) {
          if (f[0] <= 15.396958) {
            return -0.014725;
          } else {
            if (f[9] <= 0.000226) {
              return -0.000904;
            } else {
              if (f[1] <= -5.053854) {
                return 0.038307;
              } else {
                return 0.053314;
              }
            }
          }
        } else {
          if (f[8] <= -0.001426) {
            if (f[1] <= -2.632372) {
              if (f[1] <= -3.855570) {
                return -0.006788;
              } else {
                if (f[3] <= 0.003267) {
                  return -0.015999;
                } else {
                  return -0.039770;
                }
              }
            } else {
              return 0.013423;
            }
          } else {
            if (f[0] <= 26.953641) {
              if (f[6] <= 0.000054) {
                if (f[0] <= 24.430409) {
                  return 0.023819;
                } else {
                  return 0.056302;
                }
              } else {
                return -0.009573;
              }
            } else {
              if (f[9] <= 0.000198) {
                if (f[9] <= 0.000187) {
                  return -0.002069;
                } else {
                  return 0.042499;
                }
              } else {
                return -0.040431;
              }
            }
          }
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[6] <= 0.000201) {
          if (f[12] <= 0.000047) {
            return -0.008545;
          } else {
            if (f[1] <= -3.142626) {
              return -0.005598;
            } else {
              if (f[12] <= 0.000049) {
                return 0.054606;
              } else {
                if (f[3] <= 0.002124) {
                  return 0.011709;
                } else {
                  return 0.045379;
                }
              }
            }
          }
        } else {
          return -0.026388;
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[9] <= 0.000060) {
            if (f[3] <= 0.002004) {
              if (f[1] <= 2.062162) {
                if (f[1] <= -0.021332) {
                  return -0.040158;
                } else {
                  return -0.007961;
                }
              } else {
                return -0.044161;
              }
            } else {
              return 0.033790;
            }
          } else {
            if (f[19] <= 0.000000) {
              if (f[3] <= 0.000896) {
                if (f[16] <= 0.000591) {
                  return 0.048519;
                } else {
                  return -0.010116;
                }
              } else {
                if (f[16] <= 0.000624) {
                  return 0.000397;
                } else {
                  return -0.025079;
                }
              }
            } else {
              if (f[16] <= -0.000062) {
                if (f[14] <= 0.000172) {
                  return -0.004233;
                } else {
                  return -0.029747;
                }
              } else {
                return 0.008705;
              }
            }
          }
        } else {
          if (f[9] <= 0.000060) {
            if (f[1] <= 2.187805) {
              if (f[15] <= 0.000311) {
                if (f[16] <= 0.000589) {
                  return 0.012620;
                } else {
                  return 0.046590;
                }
              } else {
                return -0.008639;
              }
            } else {
              return -0.021280;
            }
          } else {
            if (f[16] <= 0.000629) {
              if (f[16] <= -0.000790) {
                if (f[3] <= 0.003267) {
                  return 0.031718;
                } else {
                  return -0.024712;
                }
              } else {
                if (f[15] <= 0.000318) {
                  return -0.006372;
                } else {
                  return 0.028775;
                }
              }
            } else {
              return 0.030036;
            }
          }
        }
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[15] <= 0.000297) {
          if (f[3] <= 0.001167) {
            return 0.037994;
          } else {
            if (f[14] <= 0.000165) {
              if (f[1] <= -3.142626) {
                return -0.011434;
              } else {
                if (f[3] <= 0.002104) {
                  return 0.003851;
                } else {
                  return 0.044091;
                }
              }
            } else {
              if (f[15] <= 0.000290) {
                return 0.045507;
              } else {
                return 0.007961;
              }
            }
          }
        } else {
          return -0.019785;
        }
      } else {
        if (f[8] <= -0.001956) {
          if (f[0] <= 15.396958) {
            return -0.014054;
          } else {
            if (f[9] <= 0.000226) {
              return -0.000878;
            } else {
              if (f[1] <= -5.053854) {
                return 0.037372;
              } else {
                return 0.052051;
              }
            }
          }
        } else {
          if (f[8] <= -0.001426) {
            if (f[1] <= -2.632372) {
              if (f[15] <= -0.001642) {
                return -0.045870;
              } else {
                if (f[0] <= 24.017978) {
                  return -0.001287;
                } else {
                  return -0.026739;
                }
              }
            } else {
              return 0.012849;
            }
          } else {
            if (f[0] <= 26.953641) {
              if (f[2] <= 0.357431) {
                if (f[0] <= 24.430409) {
                  return 0.022675;
                } else {
                  return 0.054657;
                }
              } else {
                return -0.007340;
              }
            } else {
              if (f[9] <= 0.000198) {
                if (f[9] <= 0.000187) {
                  return -0.001969;
                } else {
                  return 0.041121;
                }
              } else {
                return -0.039078;
              }
            }
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.030730;
          } else {
            if (f[0] <= 54.888433) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000146) {
                  return 0.023615;
                } else {
                  return 0.002638;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return -0.004904;
                } else {
                  return -0.042276;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[10] <= 0.000065) {
                  return 0.048337;
                } else {
                  return 0.013737;
                }
              } else {
                return -0.018085;
              }
            }
          }
        } else {
          if (f[0] <= 89.635576) {
            return 0.051226;
          } else {
            return 0.008241;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001400) {
            if (f[10] <= 0.000065) {
              if (f[8] <= 0.000714) {
                if (f[6] <= 0.000201) {
                  return -0.023447;
                } else {
                  return 0.001556;
                }
              } else {
                if (f[7] <= 0.000533) {
                  return 0.028947;
                } else {
                  return -0.025546;
                }
              }
            } else {
              if (f[10] <= 0.000068) {
                return 0.035893;
              } else {
                return -0.015778;
              }
            }
          } else {
            if (f[3] <= 0.004314) {
              if (f[2] <= 0.892279) {
                if (f[0] <= 35.556606) {
                  return -0.010564;
                } else {
                  return 0.019755;
                }
              } else {
                if (f[2] <= 0.898366) {
                  return -0.024838;
                } else {
                  return 0.001177;
                }
              }
            } else {
              return -0.027312;
            }
          }
        } else {
          if (f[3] <= 0.001656) {
            if (f[2] <= 0.817468) {
              return 0.041520;
            } else {
              if (f[0] <= 92.048842) {
                return -0.018755;
              } else {
                if (f[0] <= 100.000000) {
                  return 0.030654;
                } else {
                  return 0.004952;
                }
              }
            }
          } else {
            if (f[3] <= 0.002193) {
              return -0.029036;
            } else {
              return 0.003654;
            }
          }
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[6] <= 0.000201) {
          if (f[8] <= -0.001956) {
            return -0.005097;
          } else {
            if (f[3] <= 0.002104) {
              if (f[3] <= 0.001404) {
                if (f[2] <= 0.278128) {
                  return 0.005229;
                } else {
                  return 0.035110;
                }
              } else {
                if (f[0] <= 35.556606) {
                  return 0.023532;
                } else {
                  return -0.011912;
                }
              }
            } else {
              if (f[11] <= 0.000000) {
                return 0.034299;
              } else {
                return 0.053583;
              }
            }
          }
        } else {
          return -0.025289;
        }
      } else {
        if (f[16] <= -0.002215) {
          if (f[0] <= 15.396958) {
            return -0.010923;
          } else {
            if (f[8] <= -0.001992) {
              return 0.048875;
            } else {
              return 0.015469;
            }
          }
        } else {
          if (f[20] <= 0.000000) {
            if (f[9] <= 0.000060) {
              if (f[2] <= 0.749274) {
                return 0.023036;
              } else {
                if (f[8] <= -0.000122) {
                  return -0.033375;
                } else {
                  return -0.012235;
                }
              }
            } else {
              if (f[16] <= 0.000624) {
                if (f[6] <= 0.000210) {
                  return -0.001937;
                } else {
                  return 0.018825;
                }
              } else {
                return -0.024174;
              }
            }
          } else {
            if (f[3] <= 0.003267) {
              if (f[0] <= 30.089051) {
                return 0.053994;
              } else {
                if (f[6] <= 0.000192) {
                  return -0.003906;
                } else {
                  return 0.009818;
                }
              }
            } else {
              return -0.027231;
            }
          }
        }
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.029762;
      } else {
        if (f[12] <= 0.000073) {
          if (f[20] <= 0.000000) {
            if (f[9] <= 0.000058) {
              if (f[0] <= 100.000000) {
                return -0.007312;
              } else {
                return -0.037696;
              }
            } else {
              if (f[16] <= 0.000624) {
                if (f[6] <= 0.000213) {
                  return -0.002251;
                } else {
                  return 0.027481;
                }
              } else {
                return -0.025700;
              }
            }
          } else {
            if (f[3] <= 0.003267) {
              if (f[0] <= 30.089051) {
                return 0.052629;
              } else {
                if (f[6] <= 0.000192) {
                  return -0.003254;
                } else {
                  return 0.008850;
                }
              }
            } else {
              return -0.019240;
            }
          }
        } else {
          if (f[2] <= 0.280726) {
            if (f[16] <= -0.000511) {
              if (f[14] <= -0.001011) {
                if (f[7] <= -0.000928) {
                  return 0.018524;
                } else {
                  return -0.017914;
                }
              } else {
                return 0.039030;
              }
            } else {
              return -0.016206;
            }
          } else {
            if (f[0] <= 64.027165) {
              return 0.049344;
            } else {
              return 0.014019;
            }
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.029896;
          } else {
            if (f[0] <= 55.023972) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000146) {
                  return 0.023006;
                } else {
                  return 0.002434;
                }
              } else {
                if (f[9] <= 0.000131) {
                  return -0.003504;
                } else {
                  return -0.035726;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[10] <= 0.000065) {
                  return 0.051505;
                } else {
                  return 0.013465;
                }
              } else {
                return -0.017463;
              }
            }
          }
        } else {
          if (f[0] <= 89.635576) {
            return 0.050154;
          } else {
            return 0.008036;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[2] <= 0.961597) {
            if (f[9] <= 0.000058) {
              if (f[0] <= 100.000000) {
                return -0.007099;
              } else {
                return -0.036719;
              }
            } else {
              if (f[1] <= -2.373099) {
                return -0.022387;
              } else {
                if (f[16] <= 0.000626) {
                  return -0.001235;
                } else {
                  return -0.033718;
                }
              }
            }
          } else {
            return -0.030117;
          }
        } else {
          if (f[1] <= -0.388833) {
            return -0.022423;
          } else {
            if (f[1] <= 2.235690) {
              if (f[8] <= 0.001332) {
                if (f[1] <= 2.169932) {
                  return 0.006895;
                } else {
                  return 0.041906;
                }
              } else {
                return -0.017417;
              }
            } else {
              return -0.021808;
            }
          }
        }
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.028965;
      } else {
        if (f[10] <= 0.000052) {
          if (f[15] <= 0.000297) {
            if (f[8] <= -0.001956) {
              return -0.009560;
            } else {
              if (f[3] <= 0.001911) {
                if (f[3] <= 0.001139) {
                  return 0.041964;
                } else {
                  return 0.005570;
                }
              } else {
                if (f[14] <= -0.001082) {
                  return 0.025711;
                } else {
                  return 0.051094;
                }
              }
            }
          } else {
            return -0.019982;
          }
        } else {
          if (f[15] <= 0.000324) {
            if (f[1] <= 2.228789) {
              if (f[6] <= 0.000218) {
                if (f[20] <= 0.000000) {
                  return -0.003401;
                } else {
                  return 0.002592;
                }
              } else {
                return 0.026815;
              }
            } else {
              return -0.027237;
            }
          } else {
            return 0.024162;
          }
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[16] <= -0.000802) {
            if (f[15] <= -0.001807) {
              if (f[8] <= -0.002060) {
                return 0.006942;
              } else {
                if (f[8] <= -0.001500) {
                  return -0.024355;
                } else {
                  return -0.000938;
                }
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[13] <= 0.000056) {
                  return 0.021718;
                } else {
                  return 0.049870;
                }
              } else {
                if (f[9] <= 0.000230) {
                  return -0.000109;
                } else {
                  return 0.016952;
                }
              }
            }
          } else {
            if (f[7] <= -0.000538) {
              return -0.023083;
            } else {
              if (f[3] <= 0.001611) {
                return 0.014150;
              } else {
                return -0.012835;
              }
            }
          }
        } else {
          if (f[13] <= 0.000061) {
            if (f[13] <= 0.000055) {
              return 0.022260;
            } else {
              return 0.047448;
            }
          } else {
            return 0.009306;
          }
        }
      } else {
        if (f[3] <= 0.004528) {
          if (f[16] <= -0.000207) {
            if (f[9] <= 0.000131) {
              if (f[16] <= -0.000320) {
                if (f[8] <= -0.000294) {
                  return -0.001452;
                } else {
                  return 0.060059;
                }
              } else {
                if (f[14] <= 0.000182) {
                  return -0.006101;
                } else {
                  return -0.031925;
                }
              }
            } else {
              if (f[14] <= 0.000173) {
                return -0.016987;
              } else {
                return -0.034561;
              }
            }
          } else {
            if (f[2] <= 0.394681) {
              if (f[16] <= -0.000076) {
                return 0.053087;
              } else {
                if (f[2] <= 0.345686) {
                  return -0.015803;
                } else {
                  return 0.032684;
                }
              }
            } else {
              if (f[14] <= 0.000161) {
                if (f[3] <= 0.001545) {
                  return 0.022760;
                } else {
                  return -0.023414;
                }
              } else {
                if (f[9] <= 0.000146) {
                  return -0.000666;
                } else {
                  return -0.013932;
                }
              }
            }
          }
        } else {
          return -0.026542;
        }
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.027922;
      } else {
        if (f[0] <= 15.396958) {
          return -0.027588;
        } else {
          if (f[12] <= 0.000073) {
            if (f[16] <= -0.002215) {
              return 0.024860;
            } else {
              if (f[20] <= 0.000000) {
                if (f[9] <= 0.000058) {
                  return -0.021358;
                } else {
                  return -0.002100;
                }
              } else {
                if (f[3] <= 0.003267) {
                  return 0.004389;
                } else {
                  return -0.024861;
                }
              }
            }
          } else {
            if (f[2] <= 0.280726) {
              if (f[16] <= -0.000511) {
                if (f[14] <= -0.001116) {
                  return 0.004322;
                } else {
                  return 0.039543;
                }
              } else {
                return -0.012854;
              }
            } else {
              if (f[0] <= 64.027165) {
                return 0.047825;
              } else {
                return 0.012944;
              }
            }
          }
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.029346;
          } else {
            if (f[0] <= 55.023972) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000138) {
                  return 0.028304;
                } else {
                  return 0.002683;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return -0.004270;
                } else {
                  return -0.039852;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[10] <= 0.000065) {
                  return 0.050330;
                } else {
                  return 0.013201;
                }
              } else {
                return -0.017315;
              }
            }
          }
        } else {
          if (f[6] <= 0.000182) {
            return 0.049961;
          } else {
            return 0.008388;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001400) {
            if (f[10] <= 0.000065) {
              if (f[14] <= 0.000169) {
                return 0.002421;
              } else {
                if (f[2] <= 0.904922) {
                  return -0.024131;
                } else {
                  return -0.007685;
                }
              }
            } else {
              if (f[12] <= 0.000067) {
                return 0.036019;
              } else {
                return -0.015694;
              }
            }
          } else {
            if (f[3] <= 0.004314) {
              if (f[2] <= 0.892279) {
                if (f[0] <= 35.556606) {
                  return -0.009516;
                } else {
                  return 0.019772;
                }
              } else {
                if (f[2] <= 0.898366) {
                  return -0.023618;
                } else {
                  return 0.001402;
                }
              }
            } else {
              return -0.025200;
            }
          }
        } else {
          if (f[3] <= 0.001656) {
            if (f[2] <= 0.817468) {
              return 0.040243;
            } else {
              if (f[0] <= 92.048842) {
                return -0.018781;
              } else {
                if (f[3] <= 0.001418) {
                  return 0.018533;
                } else {
                  return -0.000217;
                }
              }
            }
          } else {
            if (f[12] <= 0.000059) {
              return -0.030379;
            } else {
              return 0.001718;
            }
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[1] <= 2.228789) {
        if (f[6] <= 0.000219) {
          if (f[10] <= 0.000052) {
            if (f[6] <= 0.000201) {
              if (f[8] <= -0.001956) {
                return -0.005804;
              } else {
                if (f[3] <= 0.002104) {
                  return 0.011186;
                } else {
                  return 0.043168;
                }
              }
            } else {
              return -0.024139;
            }
          } else {
            if (f[8] <= -0.001956) {
              if (f[0] <= 15.396958) {
                return -0.013897;
              } else {
                if (f[9] <= 0.000226) {
                  return -0.001035;
                } else {
                  return 0.043909;
                }
              }
            } else {
              if (f[8] <= -0.001426) {
                if (f[1] <= -2.632372) {
                  return -0.020155;
                } else {
                  return 0.012280;
                }
              } else {
                if (f[0] <= 26.953641) {
                  return 0.020782;
                } else {
                  return -0.001885;
                }
              }
            }
          }
        } else {
          return 0.028092;
        }
      } else {
        return -0.023055;
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.027044;
      } else {
        if (f[3] <= 0.000727) {
          return 0.029331;
        } else {
          if (f[12] <= 0.000073) {
            if (f[20] <= 0.000000) {
              if (f[2] <= 0.961597) {
                if (f[16] <= 0.000624) {
                  return -0.002022;
                } else {
                  return -0.023109;
                }
              } else {
                return -0.027908;
              }
            } else {
              if (f[3] <= 0.003267) {
                if (f[3] <= 0.002469) {
                  return 0.002679;
                } else {
                  return 0.052511;
                }
              } else {
                return -0.018588;
              }
            }
          } else {
            if (f[2] <= 0.280726) {
              if (f[16] <= -0.000511) {
                if (f[15] <= -0.000991) {
                  return 0.003579;
                } else {
                  return 0.037028;
                }
              } else {
                return -0.016671;
              }
            } else {
              if (f[1] <= 0.759762) {
                return 0.036801;
              } else {
                return 0.020999;
              }
            }
          }
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[1] <= 2.228789) {
        if (f[7] <= 0.000590) {
          if (f[12] <= 0.000068) {
            if (f[2] <= 0.961597) {
              if (f[16] <= -0.002723) {
                return 0.022743;
              } else {
                if (f[0] <= 15.396958) {
                  return -0.031297;
                } else {
                  return -0.000526;
                }
              }
            } else {
              return -0.024159;
            }
          } else {
            if (f[10] <= 0.000071) {
              if (f[6] <= -0.000096) {
                if (f[0] <= 35.556606) {
                  return 0.013910;
                } else {
                  return -0.001528;
                }
              } else {
                if (f[16] <= 0.000584) {
                  return 0.051150;
                } else {
                  return 0.007923;
                }
              }
            } else {
              return -0.005182;
            }
          }
        } else {
          if (f[8] <= 0.001250) {
            return 0.053580;
          } else {
            return 0.002347;
          }
        }
      } else {
        return -0.022404;
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[16] <= -0.000802) {
            if (f[15] <= -0.001807) {
              if (f[8] <= -0.002060) {
                return 0.005850;
              } else {
                if (f[0] <= 23.329537) {
                  return -0.028349;
                } else {
                  return -0.003767;
                }
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[16] <= -0.001608) {
                  return 0.013691;
                } else {
                  return 0.043751;
                }
              } else {
                if (f[1] <= -1.671712) {
                  return 0.009705;
                } else {
                  return -0.005314;
                }
              }
            }
          } else {
            if (f[7] <= -0.000538) {
              return -0.022652;
            } else {
              if (f[3] <= 0.001611) {
                return 0.013451;
              } else {
                return -0.012553;
              }
            }
          }
        } else {
          if (f[1] <= -1.389915) {
            return 0.046912;
          } else {
            if (f[8] <= -0.000278) {
              return -0.005809;
            } else {
              return 0.045349;
            }
          }
        }
      } else {
        if (f[1] <= -3.080495) {
          return -0.025784;
        } else {
          if (f[3] <= 0.000727) {
            return 0.028502;
          } else {
            if (f[0] <= 29.713358) {
              if (f[15] <= 0.000298) {
                if (f[1] <= -1.620210) {
                  return 0.054448;
                } else {
                  return 0.028696;
                }
              } else {
                return -0.010299;
              }
            } else {
              if (f[0] <= 32.682375) {
                return -0.033745;
              } else {
                if (f[3] <= 0.002143) {
                  return -0.002230;
                } else {
                  return 0.013892;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[15] <= 0.000297) {
          if (f[8] <= -0.001956) {
            return -0.004149;
          } else {
            if (f[17] <= 0.000000) {
              if (f[8] <= -0.000278) {
                if (f[8] <= -0.000645) {
                  return 0.003617;
                } else {
                  return -0.013478;
                }
              } else {
                if (f[2] <= 0.892853) {
                  return 0.031634;
                } else {
                  return 0.003075;
                }
              }
            } else {
              if (f[12] <= 0.000180) {
                return 0.049221;
              } else {
                if (f[15] <= -0.001236) {
                  return 0.028737;
                } else {
                  return 0.011427;
                }
              }
            }
          }
        } else {
          return -0.018228;
        }
      } else {
        if (f[15] <= 0.000324) {
          if (f[8] <= -0.001956) {
            if (f[9] <= 0.000321) {
              if (f[9] <= 0.000226) {
                return -0.001099;
              } else {
                if (f[9] <= 0.000291) {
                  return 0.048358;
                } else {
                  return 0.034519;
                }
              }
            } else {
              return -0.008458;
            }
          } else {
            if (f[8] <= -0.001426) {
              if (f[6] <= 0.000059) {
                if (f[9] <= 0.000198) {
                  return 0.019798;
                } else {
                  return -0.018594;
                }
              } else {
                return -0.034407;
              }
            } else {
              if (f[9] <= 0.000225) {
                if (f[20] <= 0.000000) {
                  return -0.003760;
                } else {
                  return 0.002520;
                }
              } else {
                if (f[9] <= 0.000262) {
                  return 0.032029;
                } else {
                  return -0.006163;
                }
              }
            }
          }
        } else {
          return 0.023303;
        }
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[1] <= 2.228789) {
        if (f[7] <= 0.000590) {
          if (f[16] <= -0.002960) {
            return 0.025693;
          } else {
            if (f[0] <= 15.396958) {
              return -0.026044;
            } else {
              if (f[8] <= -0.002060) {
                if (f[9] <= 0.000226) {
                  return -0.003392;
                } else {
                  return 0.042694;
                }
              } else {
                if (f[3] <= 0.000727) {
                  return 0.027698;
                } else {
                  return -0.000756;
                }
              }
            }
          }
        } else {
          if (f[3] <= 0.001431) {
            return -0.000148;
          } else {
            return 0.052331;
          }
        }
      } else {
        return -0.021770;
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[1] <= 2.235690) {
        if (f[10] <= 0.000052) {
          if (f[6] <= 0.000201) {
            if (f[12] <= 0.000047) {
              return -0.008944;
            } else {
              if (f[7] <= -0.000384) {
                if (f[3] <= 0.001505) {
                  return -0.008317;
                } else {
                  return 0.012876;
                }
              } else {
                if (f[2] <= 0.892853) {
                  return 0.035321;
                } else {
                  return 0.010495;
                }
              }
            }
          } else {
            return -0.021515;
          }
        } else {
          if (f[6] <= 0.000219) {
            if (f[9] <= 0.000058) {
              if (f[0] <= 100.000000) {
                return 0.009945;
              } else {
                return -0.030474;
              }
            } else {
              if (f[9] <= 0.000058) {
                return 0.022017;
              } else {
                if (f[3] <= 0.000727) {
                  return 0.025434;
                } else {
                  return -0.001103;
                }
              }
            }
          } else {
            return 0.022429;
          }
        }
      } else {
        return -0.025081;
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.024997;
      } else {
        if (f[0] <= 15.396958) {
          return -0.025421;
        } else {
          if (f[10] <= 0.000052) {
            if (f[6] <= 0.000201) {
              if (f[12] <= 0.000047) {
                return -0.010377;
              } else {
                if (f[12] <= 0.000049) {
                  return 0.042386;
                } else {
                  return 0.012528;
                }
              }
            } else {
              return -0.022235;
            }
          } else {
            if (f[15] <= 0.000324) {
              if (f[1] <= 2.228789) {
                if (f[6] <= 0.000218) {
                  return -0.001206;
                } else {
                  return 0.024565;
                }
              } else {
                return -0.024384;
              }
            } else {
              return 0.022511;
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[16] <= -0.000677) {
          if (f[16] <= -0.000802) {
            if (f[14] <= 0.000182) {
              if (f[14] <= -0.000077) {
                if (f[20] <= 0.000000) {
                  return 0.003938;
                } else {
                  return 0.037257;
                }
              } else {
                if (f[16] <= -0.000996) {
                  return -0.012795;
                } else {
                  return 0.021597;
                }
              }
            } else {
              if (f[9] <= 0.000207) {
                if (f[1] <= -1.466462) {
                  return 0.053828;
                } else {
                  return 0.010620;
                }
              } else {
                if (f[9] <= 0.000230) {
                  return -0.026725;
                } else {
                  return 0.026654;
                }
              }
            }
          } else {
            if (f[7] <= -0.000500) {
              return -0.020938;
            } else {
              if (f[3] <= 0.001611) {
                return 0.018935;
              } else {
                return -0.012005;
              }
            }
          }
        } else {
          if (f[1] <= -1.389915) {
            return 0.046078;
          } else {
            if (f[1] <= -0.575924) {
              return -0.009159;
            } else {
              return 0.044295;
            }
          }
        }
      } else {
        if (f[1] <= -3.080495) {
          return -0.024765;
        } else {
          if (f[16] <= -0.000463) {
            return -0.022833;
          } else {
            if (f[3] <= 0.002143) {
              if (f[9] <= 0.000165) {
                if (f[14] <= 0.000199) {
                  return -0.001342;
                } else {
                  return 0.024682;
                }
              } else {
                return -0.028396;
              }
            } else {
              if (f[10] <= 0.000066) {
                if (f[12] <= 0.000061) {
                  return 0.007644;
                } else {
                  return 0.056279;
                }
              } else {
                return -0.017304;
              }
            }
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.024293;
      } else {
        if (f[0] <= 15.396958) {
          return -0.024770;
        } else {
          if (f[8] <= -0.002060) {
            if (f[0] <= 24.017978) {
              return 0.041007;
            } else {
              return 0.000000;
            }
          } else {
            if (f[3] <= 0.000727) {
              return 0.026309;
            } else {
              if (f[2] <= 0.961597) {
                if (f[1] <= 2.235690) {
                  return -0.000031;
                } else {
                  return -0.023986;
                }
              } else {
                return -0.021992;
              }
            }
          }
        }
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.028843;
          } else {
            if (f[0] <= 54.888433) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000138) {
                  return 0.027241;
                } else {
                  return 0.002135;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return -0.004524;
                } else {
                  return -0.038837;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                if (f[10] <= 0.000065) {
                  return 0.044893;
                } else {
                  return 0.012288;
                }
              } else {
                return -0.017585;
              }
            }
          }
        } else {
          if (f[0] <= 89.635576) {
            return 0.048176;
          } else {
            return 0.006835;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001400) {
            if (f[10] <= 0.000065) {
              if (f[3] <= 0.000829) {
                return 0.005711;
              } else {
                if (f[16] <= 0.000610) {
                  return -0.017929;
                } else {
                  return 0.003187;
                }
              }
            } else {
              if (f[12] <= 0.000067) {
                return 0.035445;
              } else {
                return -0.014666;
              }
            }
          } else {
            if (f[3] <= 0.004314) {
              if (f[2] <= 0.892279) {
                if (f[0] <= 35.556606) {
                  return -0.009201;
                } else {
                  return 0.019364;
                }
              } else {
                if (f[2] <= 0.898366) {
                  return -0.022423;
                } else {
                  return 0.001796;
                }
              }
            } else {
              return -0.023473;
            }
          }
        } else {
          if (f[3] <= 0.001656) {
            if (f[3] <= 0.001464) {
              if (f[3] <= 0.001418) {
                if (f[0] <= 100.000000) {
                  return 0.008182;
                } else {
                  return 0.045001;
                }
              } else {
                if (f[7] <= 0.000591) {
                  return -0.015042;
                } else {
                  return 0.021268;
                }
              }
            } else {
              if (f[16] <= 0.000615) {
                return 0.012705;
              } else {
                return 0.051005;
              }
            }
          } else {
            if (f[12] <= 0.000059) {
              return -0.029823;
            } else {
              return 0.001325;
            }
          }
        }
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[1] <= 2.235690) {
        if (f[10] <= 0.000052) {
          if (f[15] <= 0.000297) {
            if (f[8] <= -0.001956) {
              return -0.005578;
            } else {
              if (f[3] <= 0.001911) {
                if (f[1] <= 0.062890) {
                  return -0.005188;
                } else {
                  return 0.019939;
                }
              } else {
                if (f[0] <= 24.293679) {
                  return 0.020903;
                } else {
                  return 0.048106;
                }
              }
            }
          } else {
            return -0.014652;
          }
        } else {
          if (f[6] <= 0.000219) {
            if (f[8] <= -0.001956) {
              if (f[0] <= 15.396958) {
                return -0.012584;
              } else {
                if (f[9] <= 0.000226) {
                  return -0.001123;
                } else {
                  return 0.040829;
                }
              }
            } else {
              if (f[8] <= -0.001426) {
                if (f[1] <= -2.632372) {
                  return -0.018690;
                } else {
                  return 0.011974;
                }
              } else {
                if (f[0] <= 26.953641) {
                  return 0.019751;
                } else {
                  return -0.001685;
                }
              }
            }
          } else {
            return 0.020831;
          }
        }
      } else {
        return -0.023611;
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.023589;
      } else {
        if (f[0] <= 15.396958) {
          return -0.023881;
        } else {
          if (f[0] <= 24.017978) {
            if (f[0] <= 21.039232) {
              if (f[2] <= 0.280726) {
                if (f[1] <= -3.962296) {
                  return 0.048768;
                } else {
                  return -0.004823;
                }
              } else {
                return -0.021647;
              }
            } else {
              if (f[16] <= -0.002059) {
                return -0.004358;
              } else {
                if (f[14] <= 0.000182) {
                  return 0.052232;
                } else {
                  return 0.025044;
                }
              }
            }
          } else {
            if (f[1] <= -3.080495) {
              if (f[0] <= 25.737954) {
                return -0.040464;
              } else {
                if (f[14] <= 0.000176) {
                  return -0.014576;
                } else {
                  return 0.019138;
                }
              }
            } else {
              if (f[0] <= 26.953641) {
                if (f[1] <= -2.000497) {
                  return 0.040489;
                } else {
                  return 0.000000;
                }
              } else {
                if (f[0] <= 28.020093) {
                  return -0.039238;
                } else {
                  return -0.000170;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[1] <= 2.228789) {
        if (f[7] <= 0.000590) {
          if (f[3] <= 0.000727) {
            return 0.025499;
          } else {
            if (f[2] <= 0.961597) {
              if (f[8] <= 0.000907) {
                if (f[7] <= 0.000529) {
                  return 0.000128;
                } else {
                  return 0.022081;
                }
              } else {
                if (f[0] <= 100.000000) {
                  return -0.016370;
                } else {
                  return 0.032674;
                }
              }
            } else {
              return -0.021203;
            }
          }
        } else {
          if (f[3] <= 0.001431) {
            return -0.000719;
          } else {
            return 0.050286;
          }
        }
      } else {
        return -0.019524;
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[10] <= 0.000052) {
        if (f[15] <= 0.000298) {
          if (f[3] <= 0.001167) {
            return 0.032850;
          } else {
            if (f[14] <= 0.000167) {
              if (f[1] <= -3.142626) {
                return -0.012042;
              } else {
                if (f[3] <= 0.002104) {
                  return 0.000774;
                } else {
                  return 0.037988;
                }
              }
            } else {
              return 0.029164;
            }
          }
        } else {
          return -0.017929;
        }
      } else {
        if (f[15] <= 0.000324) {
          if (f[1] <= 2.228789) {
            if (f[0] <= 100.000000) {
              if (f[15] <= 0.000320) {
                if (f[15] <= 0.000314) {
                  return -0.001554;
                } else {
                  return 0.013260;
                }
              } else {
                return -0.022783;
              }
            } else {
              if (f[1] <= 1.828196) {
                if (f[0] <= 100.000000) {
                  return 0.030048;
                } else {
                  return -0.013250;
                }
              } else {
                return 0.051671;
              }
            }
          } else {
            return -0.022646;
          }
        } else {
          return 0.021371;
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.023167;
      } else {
        if (f[0] <= 15.396958) {
          return -0.023178;
        } else {
          if (f[8] <= -0.002060) {
            if (f[9] <= 0.000226) {
              return -0.003009;
            } else {
              if (f[14] <= -0.000279) {
                return 0.045886;
              } else {
                return 0.031887;
              }
            }
          } else {
            if (f[20] <= 0.000000) {
              if (f[9] <= 0.000058) {
                if (f[0] <= 100.000000) {
                  return -0.005013;
                } else {
                  return -0.033728;
                }
              } else {
                if (f[0] <= 20.669162) {
                  return -0.020681;
                } else {
                  return -0.000676;
                }
              }
            } else {
              if (f[0] <= 29.713358) {
                if (f[3] <= 0.003267) {
                  return 0.049133;
                } else {
                  return -0.012141;
                }
              } else {
                if (f[9] <= 0.000060) {
                  return 0.012320;
                } else {
                  return -0.001325;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[16] <= -0.000519) {
        if (f[9] <= 0.000138) {
          return 0.042335;
        } else {
          if (f[14] <= 0.000178) {
            if (f[15] <= -0.001872) {
              if (f[7] <= -0.001596) {
                if (f[9] <= 0.000321) {
                  return 0.018992;
                } else {
                  return -0.022713;
                }
              } else {
                return -0.029201;
              }
            } else {
              if (f[14] <= -0.001281) {
                if (f[16] <= -0.001539) {
                  return 0.010774;
                } else {
                  return 0.041839;
                }
              } else {
                if (f[9] <= 0.000190) {
                  return -0.011637;
                } else {
                  return 0.010901;
                }
              }
            }
          } else {
            if (f[9] <= 0.000230) {
              if (f[9] <= 0.000200) {
                if (f[1] <= -1.466462) {
                  return 0.038341;
                } else {
                  return 0.002228;
                }
              } else {
                return -0.018420;
              }
            } else {
              if (f[9] <= 0.000307) {
                if (f[14] <= 0.000186) {
                  return 0.046960;
                } else {
                  return 0.030913;
                }
              } else {
                return 0.004300;
              }
            }
          }
        }
      } else {
        if (f[1] <= -2.814453) {
          if (f[14] <= 0.000178) {
            return -0.009749;
          } else {
            return -0.029967;
          }
        } else {
          if (f[3] <= 0.002143) {
            if (f[9] <= 0.000165) {
              if (f[14] <= 0.000199) {
                if (f[3] <= 0.000727) {
                  return 0.024387;
                } else {
                  return -0.001953;
                }
              } else {
                return 0.023584;
              }
            } else {
              return -0.026656;
            }
          } else {
            if (f[15] <= 0.000299) {
              if (f[1] <= -0.688109) {
                if (f[12] <= 0.000055) {
                  return 0.006814;
                } else {
                  return 0.045079;
                }
              } else {
                return -0.008326;
              }
            } else {
              if (f[3] <= 0.003014) {
                if (f[8] <= -0.000150) {
                  return 0.033426;
                } else {
                  return -0.005236;
                }
              } else {
                return -0.022952;
              }
            }
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[1] <= 2.235690) {
        if (f[10] <= 0.000052) {
          if (f[6] <= 0.000199) {
            if (f[8] <= -0.001956) {
              return -0.007651;
            } else {
              if (f[3] <= 0.002104) {
                if (f[3] <= 0.001444) {
                  return 0.021244;
                } else {
                  return -0.004123;
                }
              } else {
                if (f[12] <= 0.000079) {
                  return 0.047228;
                } else {
                  return 0.026209;
                }
              }
            }
          } else {
            return -0.016443;
          }
        } else {
          if (f[20] <= 0.000000) {
            if (f[8] <= -0.001956) {
              if (f[10] <= 0.000061) {
                return 0.002315;
              } else {
                if (f[1] <= -4.775388) {
                  return 0.039769;
                } else {
                  return 0.014166;
                }
              }
            } else {
              if (f[6] <= 0.000213) {
                if (f[1] <= 1.925187) {
                  return -0.002334;
                } else {
                  return -0.022326;
                }
              } else {
                if (f[3] <= 0.001445) {
                  return 0.038390;
                } else {
                  return -0.020403;
                }
              }
            }
          } else {
            if (f[6] <= 0.000192) {
              if (f[1] <= 1.234855) {
                if (f[15] <= 0.000310) {
                  return -0.001909;
                } else {
                  return 0.022944;
                }
              } else {
                return -0.033017;
              }
            } else {
              if (f[3] <= 0.001464) {
                if (f[15] <= 0.000309) {
                  return 0.015622;
                } else {
                  return -0.013576;
                }
              } else {
                return 0.047488;
              }
            }
          }
        }
      } else {
        return -0.022146;
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[16] <= -0.002960) {
        return 0.022559;
      } else {
        if (f[0] <= 15.396958) {
          return -0.022672;
        } else {
          if (f[9] <= 0.000298) {
            if (f[0] <= 20.223403) {
              if (f[6] <= -0.000147) {
                return 0.003387;
              } else {
                return -0.040715;
              }
            } else {
              if (f[0] <= 24.017978) {
                if (f[7] <= -0.001140) {
                  return -0.001836;
                } else {
                  return 0.034167;
                }
              } else {
                if (f[0] <= 25.271054) {
                  return -0.017830;
                } else {
                  return -0.000189;
                }
              }
            }
          } else {
            return 0.027364;
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[3] <= 0.000727) {
        return 0.024229;
      } else {
        if (f[2] <= 0.961597) {
          if (f[16] <= -0.002960) {
            return 0.022043;
          } else {
            if (f[10] <= 0.000052) {
              if (f[3] <= 0.001139) {
                return 0.034407;
              } else {
                if (f[3] <= 0.002104) {
                  return -0.000987;
                } else {
                  return 0.016517;
                }
              }
            } else {
              if (f[15] <= 0.000324) {
                if (f[15] <= -0.000552) {
                  return -0.007221;
                } else {
                  return -0.000310;
                }
              } else {
                return 0.020192;
              }
            }
          }
        } else {
          return -0.020500;
        }
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[16] <= 0.000474) {
        if (f[0] <= 74.254368) {
          if (f[9] <= 0.000085) {
            return -0.027811;
          } else {
            if (f[0] <= 55.023972) {
              if (f[0] <= 42.719943) {
                if (f[9] <= 0.000146) {
                  return 0.020550;
                } else {
                  return 0.001365;
                }
              } else {
                if (f[9] <= 0.000132) {
                  return -0.004107;
                } else {
                  return -0.037988;
                }
              }
            } else {
              if (f[20] <= 0.000000) {
                return 0.038520;
              } else {
                return -0.017303;
              }
            }
          }
        } else {
          if (f[6] <= 0.000182) {
            return 0.048235;
          } else {
            return 0.007751;
          }
        }
      } else {
        if (f[8] <= 0.000450) {
          if (f[8] <= 0.000247) {
            if (f[8] <= -0.000034) {
              if (f[0] <= 100.000000) {
                if (f[16] <= 0.000615) {
                  return -0.011628;
                } else {
                  return 0.013705;
                }
              } else {
                return 0.013098;
              }
            } else {
              if (f[6] <= 0.000205) {
                if (f[13] <= 0.000063) {
                  return -0.002342;
                } else {
                  return 0.026125;
                }
              } else {
                return 0.040475;
              }
            }
          } else {
            if (f[9] <= 0.000099) {
              if (f[0] <= 88.407209) {
                return -0.046572;
              } else {
                if (f[3] <= 0.001392) {
                  return 0.005822;
                } else {
                  return -0.025616;
                }
              }
            } else {
              return 0.016064;
            }
          }
        } else {
          if (f[3] <= 0.001387) {
            if (f[1] <= 1.925187) {
              if (f[3] <= 0.001382) {
                if (f[15] <= 0.000306) {
                  return 0.014446;
                } else {
                  return -0.016815;
                }
              } else {
                return -0.028654;
              }
            } else {
              if (f[3] <= 0.001359) {
                return -0.044934;
              } else {
                return -0.006555;
              }
            }
          } else {
            if (f[8] <= 0.000714) {
              if (f[3] <= 0.001429) {
                return 0.052648;
              } else {
                if (f[8] <= 0.000529) {
                  return -0.019238;
                } else {
                  return 0.020932;
                }
              }
            } else {
              if (f[3] <= 0.001453) {
                if (f[3] <= 0.001418) {
                  return 0.011746;
                } else {
                  return -0.009925;
                }
              } else {
                if (f[1] <= 2.197918) {
                  return 0.048175;
                } else {
                  return -0.011290;
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
      if (f[21] <= 0.500450) {
        if (f[14] <= 0.000180) {
          if (f[3] <= 0.001412) {
            return 0.817802;
          } else {
            if (f[10] <= 0.000059) {
              return 0.844624;
            } else {
              return 0.894246;
            }
          }
        } else {
          if (f[10] <= 0.000061) {
            return 0.939670;
          } else {
            return 0.848379;
          }
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[8] <= 0.001174) {
            if (f[16] <= -0.001024) {
              return 1.013463;
            } else {
              return 1.048378;
            }
          } else {
            if (f[16] <= 0.000593) {
              return 0.966444;
            } else {
              return 1.031846;
            }
          }
        } else {
          if (f[12] <= 0.000068) {
            if (f[15] <= 0.000303) {
              return 0.953172;
            } else {
              return 1.019530;
            }
          } else {
            if (f[6] <= -0.000551) {
              return 0.987678;
            } else {
              return 1.072617;
            }
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[19] <= 0.000000) {
          if (f[21] <= 0.468770) {
            if (f[21] <= 0.343424) {
              return -0.113821;
            } else {
              return -0.156493;
            }
          } else {
            return -0.085381;
          }
        } else {
          return -0.082167;
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[8] <= 0.001174) {
            if (f[8] <= 0.000997) {
              return 0.034202;
            } else {
              return 0.067525;
            }
          } else {
            if (f[8] <= 0.001224) {
              return -0.029034;
            } else {
              return 0.023937;
            }
          }
        } else {
          if (f[1] <= 0.244073) {
            return -0.035233;
          } else {
            if (f[8] <= 0.000790) {
              return 0.049401;
            } else {
              return -0.034074;
            }
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.154929;
        } else {
          if (f[1] <= -1.683777) {
            return -0.042515;
          } else {
            if (f[1] <= 1.312564) {
              return -0.143647;
            } else {
              return -0.096164;
            }
          }
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[8] <= 0.001174) {
            if (f[16] <= -0.001024) {
              return 0.007160;
            } else {
              return 0.041626;
            }
          } else {
            if (f[16] <= 0.000593) {
              return -0.034726;
            } else {
              return 0.026503;
            }
          }
        } else {
          if (f[1] <= 0.244073) {
            return -0.032933;
          } else {
            if (f[8] <= 0.000832) {
              return 0.044210;
            } else {
              return -0.039157;
            }
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[1] <= -0.912238) {
        if (f[15] <= 0.000289) {
          if (f[7] <= -0.001222) {
            return 0.008571;
          } else {
            if (f[1] <= -2.182370) {
              return -0.069250;
            } else {
              return -0.136290;
            }
          }
        } else {
          if (f[2] <= 0.382647) {
            return -0.024843;
          } else {
            return 0.039349;
          }
        }
      } else {
        if (f[15] <= 0.000282) {
          if (f[3] <= 0.001143) {
            return 0.066816;
          } else {
            if (f[16] <= -0.000504) {
              return 0.055972;
            } else {
              return 0.015210;
            }
          }
        } else {
          if (f[3] <= 0.000893) {
            return -0.077715;
          } else {
            if (f[14] <= 0.000175) {
              return -0.014695;
            } else {
              return 0.017308;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[19] <= 0.000000) {
          if (f[21] <= 0.468770) {
            if (f[1] <= 1.668321) {
              return -0.127613;
            } else {
              return -0.093851;
            }
          } else {
            return -0.068560;
          }
        } else {
          return -0.065007;
        }
      } else {
        if (f[8] <= 0.001174) {
          if (f[16] <= -0.000912) {
            if (f[8] <= -0.000961) {
              return 0.044255;
            } else {
              return -0.101810;
            }
          } else {
            if (f[16] <= 0.000285) {
              return 0.055096;
            } else {
              return 0.029616;
            }
          }
        } else {
          if (f[2] <= 0.903978) {
            return 0.011239;
          } else {
            return -0.046354;
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[19] <= 0.000000) {
          if (f[21] <= 0.468770) {
            if (f[21] <= 0.343424) {
              return -0.085788;
            } else {
              return -0.117834;
            }
          } else {
            return -0.063774;
          }
        } else {
          return -0.060553;
        }
      } else {
        if (f[8] <= 0.001174) {
          if (f[16] <= -0.000912) {
            if (f[8] <= -0.000961) {
              return 0.042954;
            } else {
              return -0.092481;
            }
          } else {
            if (f[16] <= 0.000285) {
              return 0.053901;
            } else {
              return 0.028579;
            }
          }
        } else {
          if (f[2] <= 0.903978) {
            return 0.010733;
          } else {
            return -0.043097;
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.120986;
        } else {
          if (f[1] <= -1.683777) {
            return -0.027251;
          } else {
            if (f[1] <= 1.312564) {
              return -0.112736;
            } else {
              return -0.074675;
            }
          }
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[8] <= 0.001174) {
            if (f[8] <= 0.000997) {
              return 0.029666;
            } else {
              return 0.064721;
            }
          } else {
            if (f[8] <= 0.001224) {
              return -0.026364;
            } else {
              return 0.023236;
            }
          }
        } else {
          if (f[12] <= 0.000068) {
            if (f[15] <= 0.000303) {
              return -0.049114;
            } else {
              return 0.013537;
            }
          } else {
            if (f[6] <= -0.000551) {
              return -0.017833;
            } else {
              return 0.064916;
            }
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[14] <= 0.000187) {
          if (f[15] <= 0.000299) {
            if (f[14] <= 0.000175) {
              return -0.089854;
            } else {
              return -0.041925;
            }
          } else {
            return -0.120562;
          }
        } else {
          return -0.051700;
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[10] <= 0.000057) {
            if (f[3] <= 0.001473) {
              return 0.022588;
            } else {
              return -0.021587;
            }
          } else {
            if (f[8] <= 0.000794) {
              return 0.047904;
            } else {
              return 0.019027;
            }
          }
        } else {
          if (f[12] <= 0.000068) {
            if (f[15] <= 0.000303) {
              return -0.045639;
            } else {
              return 0.012946;
            }
          } else {
            if (f[6] <= -0.000551) {
              return -0.016799;
            } else {
              return 0.063982;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[1] <= -0.912238) {
        if (f[15] <= 0.000289) {
          if (f[8] <= -0.000961) {
            if (f[16] <= -0.001800) {
              return 0.045793;
            } else {
              return -0.043433;
            }
          } else {
            return -0.123453;
          }
        } else {
          if (f[2] <= 0.382647) {
            return -0.019470;
          } else {
            return 0.039639;
          }
        }
      } else {
        if (f[15] <= 0.000282) {
          if (f[3] <= 0.001143) {
            return 0.064347;
          } else {
            if (f[16] <= -0.000504) {
              return 0.053348;
            } else {
              return 0.011468;
            }
          }
        } else {
          if (f[3] <= 0.000893) {
            return -0.064262;
          } else {
            if (f[1] <= 2.210201) {
              return 0.008573;
            } else {
              return -0.048163;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[19] <= 0.000000) {
          if (f[21] <= 0.468770) {
            if (f[1] <= 1.995288) {
              return -0.096304;
            } else {
              return -0.064675;
            }
          } else {
            return -0.048704;
          }
        } else {
          return -0.046332;
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[13] <= 0.000057) {
            if (f[3] <= 0.001473) {
              return 0.021276;
            } else {
              return -0.017311;
            }
          } else {
            if (f[7] <= 0.000528) {
              return 0.044231;
            } else {
              return 0.013843;
            }
          }
        } else {
          if (f[12] <= 0.000068) {
            if (f[14] <= 0.000188) {
              return -0.038975;
            } else {
              return 0.015749;
            }
          } else {
            if (f[6] <= -0.000551) {
              return -0.016383;
            } else {
              return 0.062877;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[14] <= 0.000187) {
          if (f[15] <= 0.000299) {
            if (f[14] <= 0.000175) {
              return -0.078872;
            } else {
              return -0.034965;
            }
          } else {
            return -0.107731;
          }
        } else {
          return -0.044565;
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[8] <= 0.001174) {
            if (f[8] <= 0.000997) {
              return 0.026364;
            } else {
              return 0.063201;
            }
          } else {
            if (f[16] <= 0.000593) {
              return -0.034971;
            } else {
              return 0.024501;
            }
          }
        } else {
          if (f[8] <= 0.000832) {
            if (f[2] <= 0.363755) {
              return -0.021863;
            } else {
              return 0.034256;
            }
          } else {
            return -0.040120;
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.095830;
        } else {
          if (f[2] <= 0.517846) {
            return -0.027008;
          } else {
            if (f[1] <= 1.312564) {
              return -0.094644;
            } else {
              return -0.056574;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[1] <= 1.687286) {
            if (f[1] <= -0.044823) {
              return 0.064824;
            } else {
              return 0.062938;
            }
          } else {
            return 0.034628;
          }
        } else {
          if (f[12] <= 0.000064) {
            if (f[10] <= 0.000057) {
              return 0.008700;
            } else {
              return 0.034612;
            }
          } else {
            if (f[3] <= 0.001387) {
              return 0.016805;
            } else {
              return -0.032359;
            }
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.095121;
        } else {
          if (f[3] <= 0.002522) {
            if (f[14] <= 0.000184) {
              return -0.081427;
            } else {
              return -0.047440;
            }
          } else {
            return -0.006609;
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.065115;
        } else {
          if (f[16] <= -0.000912) {
            if (f[21] <= 0.795642) {
              return -0.102965;
            } else {
              return 0.012256;
            }
          } else {
            if (f[2] <= 0.903541) {
              return 0.032438;
            } else {
              return 0.001778;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.088206;
        } else {
          if (f[1] <= -1.683777) {
            return -0.015820;
          } else {
            if (f[10] <= 0.000057) {
              return -0.038016;
            } else {
              return -0.078087;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001420) {
            return 0.033050;
          } else {
            if (f[21] <= 0.694399) {
              return 0.062239;
            } else {
              return 0.063782;
            }
          }
        } else {
          if (f[12] <= 0.000064) {
            if (f[10] <= 0.000057) {
              return 0.007283;
            } else {
              return 0.032985;
            }
          } else {
            if (f[8] <= 0.000832) {
              return 0.005311;
            } else {
              return -0.053327;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.088457;
        } else {
          if (f[1] <= -1.683777) {
            return -0.008267;
          } else {
            if (f[1] <= 1.312564) {
              return -0.081742;
            } else {
              return -0.046654;
            }
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.063842;
        } else {
          if (f[16] <= -0.000912) {
            if (f[21] <= 0.795642) {
              return -0.095621;
            } else {
              return 0.010926;
            }
          } else {
            if (f[8] <= 0.000790) {
              return 0.035050;
            } else {
              return 0.005504;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[14] <= 0.000179) {
          if (f[21] <= 0.385421) {
            return -0.046312;
          } else {
            if (f[14] <= 0.000166) {
              return -0.061982;
            } else {
              return -0.088207;
            }
          }
        } else {
          if (f[13] <= 0.000061) {
            return -0.007997;
          } else {
            return -0.067261;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[9] <= 0.000062) {
            return 0.030203;
          } else {
            if (f[12] <= 0.000061) {
              return 0.061076;
            } else {
              return 0.062133;
            }
          }
        } else {
          if (f[12] <= 0.000064) {
            if (f[13] <= 0.000057) {
              return 0.006180;
            } else {
              return 0.031418;
            }
          } else {
            if (f[8] <= 0.000832) {
              return 0.004339;
            } else {
              return -0.049859;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[1] <= -0.912238) {
        if (f[5] <= 0.000000) {
          return -0.078659;
        } else {
          if (f[16] <= -0.001800) {
            return 0.048429;
          } else {
            if (f[10] <= 0.000058) {
              return -0.055321;
            } else {
              return -0.001501;
            }
          }
        }
      } else {
        if (f[16] <= 0.000576) {
          if (f[0] <= 51.889840) {
            if (f[3] <= 0.001259) {
              return 0.062679;
            } else {
              return 0.011029;
            }
          } else {
            if (f[16] <= 0.000048) {
              return -0.023123;
            } else {
              return 0.027464;
            }
          }
        } else {
          if (f[0] <= 100.000000) {
            return -0.073353;
          } else {
            if (f[7] <= 0.000539) {
              return 0.019593;
            } else {
              return -0.010734;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.082707;
        } else {
          if (f[3] <= 0.002522) {
            if (f[1] <= 1.312564) {
              return -0.073633;
            } else {
              return -0.041646;
            }
          } else {
            return -0.000744;
          }
        }
      } else {
        if (f[12] <= 0.000064) {
          if (f[10] <= 0.000056) {
            if (f[0] <= 100.000000) {
              return -0.012360;
            } else {
              return 0.043097;
            }
          } else {
            if (f[5] <= 0.000000) {
              return 0.022903;
            } else {
              return 0.053151;
            }
          }
        } else {
          if (f[12] <= 0.000068) {
            if (f[15] <= 0.000303) {
              return -0.041182;
            } else {
              return 0.012464;
            }
          } else {
            if (f[6] <= -0.000551) {
              return -0.014153;
            } else {
              return 0.061221;
            }
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[21] <= 0.468770) {
          if (f[14] <= 0.000187) {
            if (f[21] <= 0.385421) {
              return -0.049751;
            } else {
              return -0.082333;
            }
          } else {
            return -0.022219;
          }
        } else {
          return -0.025846;
        }
      } else {
        if (f[3] <= 0.001337) {
          if (f[7] <= 0.000289) {
            if (f[14] <= -0.000371) {
              return 0.042820;
            } else {
              return 0.060948;
            }
          } else {
            if (f[0] <= 93.165953) {
              return -0.053263;
            } else {
              return 0.051704;
            }
          }
        } else {
          if (f[16] <= 0.000592) {
            if (f[8] <= -0.000961) {
              return 0.037623;
            } else {
              return -0.017702;
            }
          } else {
            if (f[3] <= 0.001439) {
              return 0.010116;
            } else {
              return 0.061800;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.078791;
        } else {
          if (f[1] <= -1.683777) {
            return -0.001540;
          } else {
            if (f[1] <= 1.312564) {
              return -0.072120;
            } else {
              return -0.037383;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001420) {
            return 0.028069;
          } else {
            if (f[21] <= 0.679894) {
              return 0.059814;
            } else {
              return 0.061335;
            }
          }
        } else {
          if (f[6] <= 0.000214) {
            if (f[0] <= 100.000000) {
              return 0.008353;
            } else {
              return 0.042388;
            }
          } else {
            return -0.032683;
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.073995;
        } else {
          if (f[7] <= -0.000083) {
            return -0.008007;
          } else {
            if (f[3] <= 0.001440) {
              return -0.041565;
            } else {
              return -0.083286;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[9] <= 0.000062) {
            return 0.025625;
          } else {
            if (f[15] <= 0.000293) {
              return 0.060537;
            } else {
              return 0.059231;
            }
          }
        } else {
          if (f[3] <= 0.001956) {
            if (f[16] <= 0.000285) {
              return 0.053762;
            } else {
              return 0.009238;
            }
          } else {
            if (f[8] <= -0.000866) {
              return 0.026281;
            } else {
              return -0.073379;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[19] <= 0.000000) {
          if (f[21] <= 0.468770) {
            if (f[1] <= 1.668321) {
              return -0.068519;
            } else {
              return -0.037470;
            }
          } else {
            return -0.017059;
          }
        } else {
          return -0.018469;
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.061521;
        } else {
          if (f[3] <= 0.001956) {
            if (f[7] <= 0.000289) {
              return 0.043331;
            } else {
              return 0.009060;
            }
          } else {
            if (f[15] <= 0.000264) {
              return -0.072511;
            } else {
              return 0.020442;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.070505;
        } else {
          if (f[7] <= -0.000083) {
            return -0.005590;
          } else {
            if (f[3] <= 0.001440) {
              return -0.038147;
            } else {
              return -0.079410;
            }
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.060844;
        } else {
          if (f[16] <= -0.000912) {
            if (f[21] <= 0.795642) {
              return -0.081746;
            } else {
              return 0.010019;
            }
          } else {
            if (f[8] <= 0.000790) {
              return 0.030613;
            } else {
              return 0.001910;
            }
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.068473;
        } else {
          if (f[7] <= -0.000083) {
            return -0.005312;
          } else {
            if (f[1] <= 1.312564) {
              return -0.065798;
            } else {
              return -0.029206;
            }
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.060213;
        } else {
          if (f[16] <= -0.000912) {
            if (f[21] <= 0.795642) {
              return -0.076190;
            } else {
              return 0.009563;
            }
          } else {
            if (f[16] <= 0.000285) {
              return 0.046443;
            } else {
              return 0.010410;
            }
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.071928;
        } else {
          if (f[3] <= 0.002522) {
            if (f[1] <= 1.312564) {
              return -0.061816;
            } else {
              return -0.027925;
            }
          } else {
            return 0.008297;
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.059624;
        } else {
          if (f[1] <= -0.912238) {
            if (f[15] <= 0.000264) {
              return -0.069117;
            } else {
              return 0.021540;
            }
          } else {
            if (f[2] <= 0.903541) {
              return 0.026594;
            } else {
              return -0.004668;
            }
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.385421) {
            if (f[15] <= 0.000292) {
              return -0.014428;
            } else {
              return -0.059612;
            }
          } else {
            if (f[10] <= 0.000058) {
              return -0.070157;
            } else {
              return -0.074308;
            }
          }
        } else {
          return -0.009839;
        }
      } else {
        if (f[8] <= 0.001174) {
          if (f[8] <= 0.000970) {
            if (f[8] <= 0.000790) {
              return 0.017183;
            } else {
              return -0.034351;
            }
          } else {
            if (f[16] <= 0.000601) {
              return 0.063731;
            } else {
              return 0.027738;
            }
          }
        } else {
          if (f[16] <= 0.000591) {
            return -0.042617;
          } else {
            return 0.004301;
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[1] <= -3.062703) {
          return -0.069997;
        } else {
          if (f[3] <= 0.002522) {
            if (f[10] <= 0.000057) {
              return -0.018770;
            } else {
              return -0.054267;
            }
          } else {
            return 0.009301;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001420) {
            return 0.020712;
          } else {
            if (f[12] <= 0.000063) {
              return 0.058041;
            } else {
              return 0.059985;
            }
          }
        } else {
          if (f[12] <= 0.000064) {
            if (f[10] <= 0.000058) {
              return 0.001398;
            } else {
              return 0.026103;
            }
          } else {
            if (f[8] <= 0.000832) {
              return -0.000134;
            } else {
              return -0.048947;
            }
          }
        }
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.385421) {
            if (f[15] <= 0.000292) {
              return -0.012165;
            } else {
              return -0.056741;
            }
          } else {
            if (f[10] <= 0.000058) {
              return -0.068376;
            } else {
              return -0.071691;
            }
          }
        } else {
          return -0.007466;
        }
      } else {
        if (f[8] <= 0.001174) {
          if (f[8] <= 0.000970) {
            if (f[8] <= 0.000790) {
              return 0.016079;
            } else {
              return -0.032603;
            }
          } else {
            if (f[9] <= 0.000060) {
              return 0.061795;
            } else {
              return 0.031339;
            }
          }
        } else {
          if (f[14] <= 0.000183) {
            return -0.002791;
          } else {
            return -0.044076;
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.063709;
        } else {
          if (f[2] <= 0.517846) {
            return -0.002774;
          } else {
            if (f[7] <= 0.000418) {
              return -0.064941;
            } else {
              return -0.023072;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001420) {
            return 0.019579;
          } else {
            if (f[21] <= 0.694399) {
              return 0.057410;
            } else {
              return 0.059293;
            }
          }
        } else {
          if (f[12] <= 0.000064) {
            if (f[10] <= 0.000058) {
              return 0.000789;
            } else {
              return 0.024881;
            }
          } else {
            if (f[8] <= 0.000832) {
              return -0.000782;
            } else {
              return -0.044862;
            }
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.385421) {
            if (f[15] <= 0.000292) {
              return -0.010665;
            } else {
              return -0.054213;
            }
          } else {
            if (f[10] <= 0.000058) {
              return -0.066375;
            } else {
              return -0.069548;
            }
          }
        } else {
          return -0.005552;
        }
      } else {
        if (f[1] <= -0.912238) {
          if (f[1] <= -3.360389) {
            return 0.037575;
          } else {
            if (f[15] <= 0.000264) {
              return -0.056618;
            } else {
              return 0.012972;
            }
          }
        } else {
          if (f[7] <= 0.000289) {
            if (f[4] <= 0.000000) {
              return 0.056122;
            } else {
              return 0.016182;
            }
          } else {
            if (f[9] <= 0.000072) {
              return 0.011367;
            } else {
              return -0.053177;
            }
          }
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[1] <= -3.062703) {
          return -0.067522;
        } else {
          if (f[1] <= -1.683777) {
            return 0.009979;
          } else {
            if (f[1] <= 1.312564) {
              return -0.058666;
            } else {
              return -0.019839;
            }
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.058263;
        } else {
          if (f[3] <= 0.001956) {
            if (f[6] <= 0.000155) {
              return 0.043043;
            } else {
              return 0.006698;
            }
          } else {
            if (f[15] <= 0.000264) {
              return -0.059296;
            } else {
              return 0.014878;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.385421) {
            if (f[15] <= 0.000292) {
              return -0.008599;
            } else {
              return -0.051821;
            }
          } else {
            if (f[13] <= 0.000058) {
              return -0.064826;
            } else {
              return -0.067957;
            }
          }
        } else {
          return -0.003765;
        }
      } else {
        if (f[8] <= 0.001174) {
          if (f[8] <= 0.000970) {
            if (f[8] <= 0.000790) {
              return 0.014409;
            } else {
              return -0.031559;
            }
          } else {
            if (f[0] <= 100.000000) {
              return 0.062716;
            } else {
              return 0.019936;
            }
          }
        } else {
          if (f[16] <= 0.000591) {
            return -0.039986;
          } else {
            return 0.004870;
          }
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.060785;
        } else {
          if (f[16] <= 0.000601) {
            if (f[8] <= 0.000586) {
              return 0.008777;
            } else {
              return -0.039663;
            }
          } else {
            return -0.049826;
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.057693;
        } else {
          if (f[16] <= -0.000912) {
            if (f[6] <= -0.000569) {
              return 0.011060;
            } else {
              return -0.069389;
            }
          } else {
            if (f[16] <= 0.000285) {
              return 0.043163;
            } else {
              return 0.006562;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[9] <= 0.000133) {
        if (f[2] <= 0.692394) {
          if (f[7] <= -0.000238) {
            return -0.024277;
          } else {
            if (f[14] <= 0.000179) {
              return 0.019213;
            } else {
              return 0.062348;
            }
          }
        } else {
          if (f[9] <= 0.000096) {
            if (f[7] <= 0.000539) {
              return 0.014763;
            } else {
              return -0.008607;
            }
          } else {
            return -0.067808;
          }
        }
      } else {
        if (f[8] <= -0.000984) {
          if (f[15] <= -0.001820) {
            return 0.031374;
          } else {
            if (f[15] <= 0.000290) {
              return -0.018170;
            } else {
              return 0.018803;
            }
          }
        } else {
          if (f[3] <= 0.001462) {
            return 0.014422;
          } else {
            if (f[5] <= 0.000000) {
              return -0.093701;
            } else {
              return -0.018135;
            }
          }
        }
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.385421) {
            if (f[16] <= 0.000597) {
              return -0.015215;
            } else {
              return -0.041111;
            }
          } else {
            if (f[10] <= 0.000058) {
              return -0.063537;
            } else {
              return -0.065992;
            }
          }
        } else {
          return -0.001714;
        }
      } else {
        if (f[0] <= 100.000000) {
          if (f[3] <= 0.001393) {
            if (f[16] <= 0.000588) {
              return 0.029285;
            } else {
              return -0.017249;
            }
          } else {
            if (f[8] <= -0.000961) {
              return 0.026269;
            } else {
              return -0.020221;
            }
          }
        } else {
          if (f[6] <= 0.000213) {
            if (f[14] <= 0.000183) {
              return 0.059793;
            } else {
              return 0.047123;
            }
          } else {
            if (f[3] <= 0.001439) {
              return -0.057600;
            } else {
              return 0.060686;
            }
          }
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[21] <= 0.502513) {
        if (f[2] <= 0.301387) {
          return -0.059082;
        } else {
          if (f[16] <= 0.000601) {
            if (f[4] <= 0.000000) {
              return 0.011905;
            } else {
              return -0.035789;
            }
          } else {
            return -0.047327;
          }
        }
      } else {
        if (f[1] <= -3.360389) {
          return 0.057048;
        } else {
          if (f[16] <= -0.000912) {
            if (f[21] <= 0.795642) {
              return -0.063960;
            } else {
              return 0.009897;
            }
          } else {
            if (f[16] <= 0.000285) {
              return 0.041709;
            } else {
              return 0.005913;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[12] <= 0.000061) {
          if (f[10] <= 0.000059) {
            if (f[8] <= 0.000249) {
              return -0.058147;
            } else {
              return -0.023808;
            }
          } else {
            return 0.006312;
          }
        } else {
          return -0.060893;
        }
      } else {
        if (f[0] <= 100.000000) {
          if (f[16] <= 0.000586) {
            if (f[1] <= -0.912238) {
              return -0.012950;
            } else {
              return 0.019492;
            }
          } else {
            if (f[7] <= 0.000289) {
              return 0.038605;
            } else {
              return -0.049279;
            }
          }
        } else {
          if (f[8] <= 0.000790) {
            if (f[12] <= 0.000059) {
              return 0.034641;
            } else {
              return 0.059336;
            }
          } else {
            if (f[8] <= 0.000900) {
              return -0.049611;
            } else {
              return 0.017018;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[0] <= 100.000000) {
        if (f[6] <= 0.000165) {
          if (f[3] <= 0.001299) {
            if (f[10] <= 0.000064) {
              return 0.035920;
            } else {
              return -0.015340;
            }
          } else {
            if (f[16] <= -0.002021) {
              return 0.030595;
            } else {
              return -0.020698;
            }
          }
        } else {
          if (f[16] <= 0.000583) {
            return -0.007228;
          } else {
            return -0.094699;
          }
        }
      } else {
        if (f[7] <= 0.000539) {
          if (f[8] <= 0.000968) {
            if (f[10] <= 0.000058) {
              return -0.010059;
            } else {
              return 0.027065;
            }
          } else {
            return 0.062002;
          }
        } else {
          if (f[1] <= 1.969564) {
            return -0.068294;
          } else {
            if (f[8] <= 0.001174) {
              return 0.021863;
            } else {
              return -0.010578;
            }
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[12] <= 0.000064) {
        if (f[14] <= 0.000187) {
          if (f[15] <= 0.000311) {
            if (f[12] <= 0.000057) {
              return -0.007049;
            } else {
              return 0.015494;
            }
          } else {
            return -0.067771;
          }
        } else {
          if (f[1] <= 1.820655) {
            if (f[14] <= 0.000192) {
              return 0.034123;
            } else {
              return -0.019247;
            }
          } else {
            return 0.078378;
          }
        }
      } else {
        if (f[14] <= -0.000833) {
          return 0.032612;
        } else {
          if (f[2] <= 0.363755) {
            return -0.061047;
          } else {
            if (f[12] <= 0.000066) {
              return -0.029736;
            } else {
              return 0.022279;
            }
          }
        }
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[21] <= 0.468770) {
        if (f[14] <= 0.000187) {
          if (f[21] <= 0.362058) {
            return -0.020184;
          } else {
            if (f[16] <= 0.000533) {
              return -0.047289;
            } else {
              return -0.063924;
            }
          }
        } else {
          return 0.002186;
        }
      } else {
        if (f[0] <= 100.000000) {
          if (f[14] <= 0.000182) {
            if (f[16] <= 0.000586) {
              return 0.005130;
            } else {
              return -0.054450;
            }
          } else {
            if (f[2] <= 0.906577) {
              return 0.038417;
            } else {
              return -0.022440;
            }
          }
        } else {
          if (f[8] <= 0.000790) {
            if (f[12] <= 0.000059) {
              return 0.034056;
            } else {
              return 0.058574;
            }
          } else {
            if (f[3] <= 0.001439) {
              return -0.011958;
            } else {
              return 0.061357;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[8] <= 0.001277) {
        if (f[8] <= 0.001183) {
          if (f[8] <= 0.000970) {
            if (f[8] <= 0.000790) {
              return 0.002336;
            } else {
              return -0.031483;
            }
          } else {
            if (f[3] <= 0.001428) {
              return 0.046634;
            } else {
              return -0.024439;
            }
          }
        } else {
          return -0.037513;
        }
      } else {
        return 0.037076;
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[9] <= 0.000133) {
        if (f[14] <= 0.000175) {
          if (f[10] <= 0.000065) {
            if (f[3] <= 0.001449) {
              return 0.005001;
            } else {
              return -0.050628;
            }
          } else {
            return -0.064528;
          }
        } else {
          if (f[8] <= 0.000790) {
            if (f[8] <= 0.000405) {
              return 0.012287;
            } else {
              return 0.047507;
            }
          } else {
            if (f[15] <= 0.000311) {
              return 0.008679;
            } else {
              return -0.043816;
            }
          }
        }
      } else {
        if (f[8] <= -0.000866) {
          if (f[12] <= 0.000067) {
            if (f[1] <= -3.096534) {
              return -0.000164;
            } else {
              return 0.031004;
            }
          } else {
            return -0.019484;
          }
        } else {
          if (f[1] <= -0.912238) {
            return -0.054965;
          } else {
            return -0.009321;
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[8] <= 0.001146) {
          if (f[21] <= 0.468770) {
            if (f[19] <= 0.000000) {
              return -0.052651;
            } else {
              return 0.006311;
            }
          } else {
            if (f[2] <= 0.436929) {
              return -0.036057;
            } else {
              return 0.009702;
            }
          }
        } else {
          return 0.022407;
        }
      } else {
        if (f[3] <= 0.001337) {
          if (f[7] <= 0.000289) {
            if (f[16] <= 0.000567) {
              return 0.055772;
            } else {
              return 0.058056;
            }
          } else {
            if (f[9] <= 0.000060) {
              return 0.060722;
            } else {
              return -0.036268;
            }
          }
        } else {
          if (f[16] <= 0.000590) {
            if (f[8] <= -0.000961) {
              return 0.036400;
            } else {
              return -0.024149;
            }
          } else {
            if (f[2] <= 0.903541) {
              return 0.047750;
            } else {
              return -0.012767;
            }
          }
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[12] <= 0.000062) {
          if (f[14] <= 0.000176) {
            if (f[10] <= 0.000059) {
              return -0.042083;
            } else {
              return -0.002424;
            }
          } else {
            if (f[21] <= 0.437734) {
              return -0.019078;
            } else {
              return 0.041257;
            }
          }
        } else {
          if (f[3] <= 0.001427) {
            return -0.068012;
          } else {
            return -0.022128;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[12] <= 0.000060) {
            return 0.032447;
          } else {
            return 0.058151;
          }
        } else {
          if (f[7] <= 0.000583) {
            if (f[7] <= 0.000573) {
              return 0.005516;
            } else {
              return 0.063387;
            }
          } else {
            return -0.047383;
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[8] <= 0.001146) {
          if (f[21] <= 0.468770) {
            if (f[19] <= 0.000000) {
              return -0.050902;
            } else {
              return 0.007496;
            }
          } else {
            if (f[12] <= 0.000063) {
              return 0.005029;
            } else {
              return -0.046935;
            }
          }
        } else {
          return 0.022160;
        }
      } else {
        if (f[3] <= 0.001337) {
          if (f[7] <= 0.000289) {
            if (f[16] <= 0.000567) {
              return 0.055409;
            } else {
              return 0.057534;
            }
          } else {
            if (f[9] <= 0.000060) {
              return 0.060045;
            } else {
              return -0.034111;
            }
          }
        } else {
          if (f[16] <= 0.000590) {
            if (f[8] <= -0.000961) {
              return 0.035061;
            } else {
              return -0.023342;
            }
          } else {
            if (f[2] <= 0.903541) {
              return 0.046709;
            } else {
              return -0.012256;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[8] <= 0.001146) {
          if (f[10] <= 0.000066) {
            if (f[21] <= 0.468770) {
              return -0.035958;
            } else {
              return 0.002426;
            }
          } else {
            return -0.067038;
          }
        } else {
          return 0.021079;
        }
      } else {
        if (f[3] <= 0.001337) {
          if (f[7] <= 0.000289) {
            if (f[6] <= 0.000136) {
              return 0.055080;
            } else {
              return 0.056991;
            }
          } else {
            if (f[0] <= 93.165953) {
              return -0.037387;
            } else {
              return 0.046983;
            }
          }
        } else {
          if (f[15] <= 0.000295) {
            if (f[1] <= 2.111771) {
              return -0.017747;
            } else {
              return 0.061778;
            }
          } else {
            if (f[2] <= 0.904092) {
              return 0.041472;
            } else {
              return -0.011362;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[12] <= 0.000062) {
          if (f[14] <= 0.000187) {
            if (f[21] <= 0.500450) {
              return -0.028569;
            } else {
              return 0.013804;
            }
          } else {
            return 0.050968;
          }
        } else {
          if (f[3] <= 0.001427) {
            return -0.063941;
          } else {
            return -0.017661;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[12] <= 0.000061) {
            return 0.031806;
          } else {
            return 0.057728;
          }
        } else {
          if (f[7] <= 0.000583) {
            if (f[7] <= 0.000573) {
              return 0.004600;
            } else {
              return 0.062107;
            }
          } else {
            return -0.043758;
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[8] <= 0.001146) {
          if (f[4] <= 0.000000) {
            if (f[10] <= 0.000056) {
              return -0.043599;
            } else {
              return -0.001662;
            }
          } else {
            if (f[16] <= 0.000586) {
              return -0.020892;
            } else {
              return -0.064569;
            }
          }
        } else {
          return 0.020510;
        }
      } else {
        if (f[3] <= 0.001337) {
          if (f[7] <= 0.000289) {
            if (f[16] <= 0.000567) {
              return 0.054807;
            } else {
              return 0.056673;
            }
          } else {
            if (f[9] <= 0.000060) {
              return 0.058998;
            } else {
              return -0.030421;
            }
          }
        } else {
          if (f[16] <= 0.000590) {
            if (f[8] <= -0.000961) {
              return 0.034065;
            } else {
              return -0.022448;
            }
          } else {
            if (f[2] <= 0.902918) {
              return 0.048251;
            } else {
              return -0.008618;
            }
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[21] <= 0.500450) {
        if (f[3] <= 0.001410) {
          if (f[15] <= 0.000293) {
            return -0.018323;
          } else {
            return -0.063940;
          }
        } else {
          if (f[3] <= 0.001440) {
            return 0.022679;
          } else {
            if (f[2] <= 0.517846) {
              return -0.006355;
            } else {
              return -0.063327;
            }
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[3] <= 0.001420) {
            return 0.004675;
          } else {
            if (f[12] <= 0.000063) {
              return 0.055497;
            } else {
              return 0.058032;
            }
          }
        } else {
          if (f[12] <= 0.000063) {
            if (f[15] <= 0.000311) {
              return 0.014285;
            } else {
              return -0.034209;
            }
          } else {
            if (f[15] <= 0.000310) {
              return -0.022334;
            } else {
              return 0.024744;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[21] <= 0.552531) {
        if (f[12] <= 0.000062) {
          if (f[8] <= 0.001146) {
            if (f[12] <= 0.000055) {
              return -0.048003;
            } else {
              return -0.000225;
            }
          } else {
            return 0.037136;
          }
        } else {
          if (f[6] <= 0.000027) {
            return -0.058363;
          } else {
            return -0.025731;
          }
        }
      } else {
        if (f[20] <= 0.000000) {
          if (f[12] <= 0.000061) {
            return 0.029520;
          } else {
            return 0.056904;
          }
        } else {
          if (f[7] <= 0.000583) {
            if (f[7] <= 0.000573) {
              return 0.003867;
            } else {
              return 0.061371;
            }
          } else {
            return -0.040220;
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
// Main model trees: 600, Meta trees: 200
function predict_frxUSDJPY(features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const f = [features["rsi"] ?? 0, features["macd_hist"] ?? 0, features["bb_pos"] ?? 0, features["bb_width"] ?? 0, features["ema_bull"] ?? 0, features["ema_bear"] ?? 0, features["price_ema8_dist"] ?? 0, features["price_ema21_dist"] ?? 0, features["price_ema50_dist"] ?? 0, features["atr_pct"] ?? 0, features["candle_body"] ?? 0, features["candle_dir"] ?? 0, features["high_low_range"] ?? 0, features["momentum_1"] ?? 0, features["momentum_3"] ?? 0, features["momentum_5"] ?? 0, features["momentum_10"] ?? 0, features["rsi_oversold"] ?? 0, features["rsi_overbought"] ?? 0, features["rsi_neutral"] ?? 0, features["trend5m"] ?? 0];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
    // Tree 0
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.020413;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000159) {
              return -0.018778;
            } else {
              return 0.009155;
            }
          } else {
            if (f[14] <= -0.000450) {
              return -0.011727;
            } else {
              if (f[15] <= -0.000376) {
                if (f[20] <= 0.000000) {
                  return -0.000582;
                } else {
                  if (f[0] <= 39.074885) {
                    return 0.011202;
                  } else {
                    return 0.020868;
                  }
                }
              } else {
                if (f[10] <= -0.000210) {
                  if (f[20] <= 0.000000) {
                    return -0.013380;
                  } else {
                    return -0.005049;
                  }
                } else {
                  if (f[20] <= 0.000000) {
                    return 0.002878;
                  } else {
                    return -0.001292;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000177) {
            if (f[12] <= 0.000178) {
              if (f[7] <= 0.000424) {
                if (f[10] <= 0.000013) {
                  return -0.020533;
                } else {
                  return -0.008790;
                }
              } else {
                return 0.002806;
              }
            } else {
              return 0.006990;
            }
          } else {
            return -0.016921;
          }
        }
      }
    })(f)
    // Tree 1
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.025773;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.018835;
            } else {
              return 0.002983;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.016985;
            } else {
              if (f[13] <= -0.000095) {
                if (f[3] <= 0.001201) {
                  if (f[3] <= 0.000914) {
                    return -0.002439;
                  } else {
                    return -0.010929;
                  }
                } else {
                  return 0.009107;
                }
              } else {
                if (f[9] <= 0.000079) {
                  return 0.017895;
                } else {
                  if (f[9] <= 0.000252) {
                    return 0.002552;
                  } else {
                    return 0.010304;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000376) {
              if (f[0] <= 58.407079) {
                if (f[1] <= 0.018296) {
                  return -0.006339;
                } else {
                  return -0.017745;
                }
              } else {
                if (f[0] <= 71.031259) {
                  if (f[3] <= 0.001029) {
                    return -0.001457;
                  } else {
                    return 0.012540;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.019778;
                  } else {
                    return -0.004683;
                  }
                }
              }
            } else {
              return 0.014778;
            }
          } else {
            return -0.028035;
          }
        }
      }
    })(f)
    // Tree 2
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.025269;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.018464;
            } else {
              return 0.002924;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.016649;
            } else {
              if (f[12] <= 0.000241) {
                if (f[9] <= 0.000077) {
                  return 0.017827;
                } else {
                  if (f[4] <= 0.000000) {
                    return 0.001471;
                  } else {
                    return 0.007018;
                  }
                }
              } else {
                if (f[9] <= 0.000284) {
                  if (f[16] <= 0.000236) {
                    return -0.008234;
                  } else {
                    return 0.006393;
                  }
                } else {
                  return 0.011127;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000376) {
              if (f[12] <= 0.000210) {
                if (f[0] <= 71.031259) {
                  if (f[0] <= 65.823663) {
                    return -0.007341;
                  } else {
                    return 0.006792;
                  }
                } else {
                  if (f[8] <= 0.000507) {
                    return -0.018976;
                  } else {
                    return -0.003874;
                  }
                }
              } else {
                if (f[15] <= 0.000185) {
                  return 0.012324;
                } else {
                  return -0.003235;
                }
              }
            } else {
              return 0.014485;
            }
          } else {
            return -0.027484;
          }
        }
      }
    })(f)
    // Tree 3
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.024783;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.009074) {
                return -0.003852;
              } else {
                return 0.014976;
              }
            } else {
              if (f[9] <= 0.000157) {
                return -0.024353;
              } else {
                if (f[9] <= 0.000202) {
                  return 0.000869;
                } else {
                  return -0.014912;
                }
              }
            }
          } else {
            if (f[3] <= 0.001193) {
              if (f[9] <= 0.000184) {
                if (f[9] <= 0.000058) {
                  return -0.014646;
                } else {
                  if (f[10] <= -0.000063) {
                    return -0.002494;
                  } else {
                    return 0.006172;
                  }
                }
              } else {
                if (f[8] <= -0.000215) {
                  if (f[9] <= 0.000221) {
                    return -0.003494;
                  } else {
                    return 0.021019;
                  }
                } else {
                  if (f[16] <= 0.000108) {
                    return -0.010482;
                  } else {
                    return -0.001239;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000051) {
                if (f[6] <= -0.000046) {
                  return 0.009415;
                } else {
                  return 0.022606;
                }
              } else {
                if (f[14] <= 0.000210) {
                  return -0.001975;
                } else {
                  return 0.009290;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000376) {
              if (f[19] <= 0.000000) {
                if (f[9] <= 0.000178) {
                  if (f[9] <= 0.000118) {
                    return -0.008116;
                  } else {
                    return 0.000788;
                  }
                } else {
                  if (f[8] <= 0.000472) {
                    return 0.001883;
                  } else {
                    return -0.022990;
                  }
                }
              } else {
                return -0.013782;
              }
            } else {
              return 0.014199;
            }
          } else {
            return -0.026954;
          }
        }
      }
    })(f)
    // Tree 4
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.024313;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[3] <= 0.001414) {
              return -0.016524;
            } else {
              return 0.000110;
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[12] <= 0.000247) {
                if (f[3] <= 0.000898) {
                  if (f[8] <= 0.000034) {
                    return 0.000757;
                  } else {
                    return 0.007392;
                  }
                } else {
                  if (f[3] <= 0.000960) {
                    return -0.013297;
                  } else {
                    return 0.000787;
                  }
                }
              } else {
                if (f[8] <= -0.000070) {
                  if (f[20] <= 0.000000) {
                    return -0.010168;
                  } else {
                    return 0.005068;
                  }
                } else {
                  if (f[16] <= 0.000102) {
                    return -0.019612;
                  } else {
                    return -0.002112;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000057) {
                if (f[2] <= 0.248717) {
                  return 0.003606;
                } else {
                  if (f[2] <= 0.509784) {
                    return 0.026051;
                  } else {
                    return 0.012321;
                  }
                }
              } else {
                if (f[6] <= 0.000054) {
                  return -0.006775;
                } else {
                  if (f[16] <= 0.000318) {
                    return 0.014210;
                  } else {
                    return 0.001378;
                  }
                }
              }
            }
          }
        } else {
          if (f[2] <= 0.953183) {
            if (f[15] <= 0.000349) {
              if (f[3] <= 0.001033) {
                if (f[14] <= 0.000044) {
                  if (f[15] <= -0.000051) {
                    return -0.020991;
                  } else {
                    return -0.009667;
                  }
                } else {
                  if (f[6] <= 0.000084) {
                    return 0.004777;
                  } else {
                    return -0.007778;
                  }
                }
              } else {
                if (f[14] <= 0.000089) {
                  if (f[0] <= 71.858129) {
                    return 0.015500;
                  } else {
                    return -0.001853;
                  }
                } else {
                  return -0.010076;
                }
              }
            } else {
              return -0.013657;
            }
          } else {
            if (f[0] <= 75.891608) {
              if (f[8] <= 0.000482) {
                return 0.014933;
              } else {
                return -0.003013;
              }
            } else {
              return -0.010455;
            }
          }
        }
      }
    })(f)
    // Tree 5
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.023859;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.017763;
            } else {
              return 0.002944;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.016067;
            } else {
              if (f[12] <= 0.000241) {
                if (f[3] <= 0.001320) {
                  if (f[9] <= 0.000184) {
                    return 0.004320;
                  } else {
                    return -0.001698;
                  }
                } else {
                  if (f[14] <= 0.000076) {
                    return 0.018064;
                  } else {
                    return 0.001226;
                  }
                }
              } else {
                if (f[9] <= 0.000284) {
                  if (f[3] <= 0.001183) {
                    return -0.008326;
                  } else {
                    return 0.002832;
                  }
                } else {
                  return 0.010716;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000376) {
              if (f[12] <= 0.000210) {
                if (f[0] <= 71.031259) {
                  if (f[0] <= 65.823663) {
                    return -0.007015;
                  } else {
                    return 0.006735;
                  }
                } else {
                  if (f[8] <= 0.000507) {
                    return -0.018479;
                  } else {
                    return -0.003593;
                  }
                }
              } else {
                if (f[9] <= 0.000175) {
                  return 0.010540;
                } else {
                  return -0.002482;
                }
              }
            } else {
              return 0.013987;
            }
          } else {
            return -0.026291;
          }
        }
      }
    })(f)
    // Tree 6
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.023420;
      } else {
        if (f[0] <= 74.258966) {
          if (f[0] <= 22.208049) {
            if (f[3] <= 0.001414) {
              return -0.015960;
            } else {
              return 0.000232;
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[12] <= 0.000247) {
                if (f[8] <= 0.000293) {
                  if (f[8] <= 0.000034) {
                    return 0.000032;
                  } else {
                    return 0.005800;
                  }
                } else {
                  if (f[0] <= 64.745470) {
                    return -0.008539;
                  } else {
                    return 0.002554;
                  }
                }
              } else {
                if (f[6] <= 0.000224) {
                  if (f[15] <= 0.000159) {
                    return -0.004710;
                  } else {
                    return -0.020312;
                  }
                } else {
                  return 0.006384;
                }
              }
            } else {
              if (f[1] <= 0.024599) {
                if (f[7] <= -0.000216) {
                  if (f[14] <= 0.000051) {
                    return 0.007832;
                  } else {
                    return -0.007019;
                  }
                } else {
                  if (f[14] <= 0.000076) {
                    return 0.023776;
                  } else {
                    return 0.010148;
                  }
                }
              } else {
                return -0.003499;
              }
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.025498;
            } else {
              return -0.003144;
            }
          } else {
            if (f[3] <= 0.001097) {
              return 0.008255;
            } else {
              if (f[14] <= 0.000152) {
                return 0.001883;
              } else {
                return -0.014799;
              }
            }
          }
        }
      }
    })(f)
    // Tree 7
    (function(f) {
      if (f[1] <= -0.059127) {
        return 0.020965;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 24.411221) {
            if (f[9] <= 0.000160) {
              if (f[1] <= -0.025012) {
                return -0.024358;
              } else {
                return -0.004549;
              }
            } else {
              return 0.004985;
            }
          } else {
            if (f[9] <= 0.000289) {
              if (f[12] <= 0.000236) {
                if (f[14] <= 0.000382) {
                  if (f[1] <= 0.021958) {
                    return 0.001976;
                  } else {
                    return -0.004200;
                  }
                } else {
                  return 0.017260;
                }
              } else {
                if (f[16] <= 0.000236) {
                  if (f[7] <= -0.000161) {
                    return -0.001625;
                  } else {
                    return -0.012980;
                  }
                } else {
                  if (f[10] <= 0.000133) {
                    return -0.005511;
                  } else {
                    return 0.012587;
                  }
                }
              }
            } else {
              return 0.011571;
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            if (f[1] <= 0.018913) {
              return -0.011857;
            } else {
              return -0.020593;
            }
          } else {
            if (f[1] <= 0.031515) {
              return 0.010567;
            } else {
              if (f[9] <= 0.000156) {
                return 0.000199;
              } else {
                return -0.017358;
              }
            }
          }
        }
      }
    })(f)
    // Tree 8
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.022751;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.009074) {
                return -0.003481;
              } else {
                return 0.014558;
              }
            } else {
              if (f[9] <= 0.000157) {
                return -0.023295;
              } else {
                if (f[9] <= 0.000202) {
                  return 0.000921;
                } else {
                  return -0.014770;
                }
              }
            }
          } else {
            if (f[3] <= 0.001193) {
              if (f[12] <= 0.000247) {
                if (f[9] <= 0.000058) {
                  return -0.013549;
                } else {
                  if (f[9] <= 0.000184) {
                    return 0.004375;
                  } else {
                    return -0.002521;
                  }
                }
              } else {
                if (f[8] <= -0.000070) {
                  if (f[3] <= 0.000849) {
                    return 0.006924;
                  } else {
                    return -0.008357;
                  }
                } else {
                  if (f[10] <= 0.000140) {
                    return -0.018482;
                  } else {
                    return -0.005227;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000051) {
                if (f[6] <= -0.000046) {
                  return 0.008676;
                } else {
                  return 0.021356;
                }
              } else {
                if (f[14] <= 0.000210) {
                  return -0.002060;
                } else {
                  return 0.008716;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[12] <= 0.000210) {
                if (f[16] <= 0.000406) {
                  if (f[9] <= 0.000163) {
                    return -0.004214;
                  } else {
                    return -0.018993;
                  }
                } else {
                  if (f[16] <= 0.000476) {
                    return 0.011404;
                  } else {
                    return -0.004770;
                  }
                }
              } else {
                if (f[9] <= 0.000175) {
                  return 0.009984;
                } else {
                  return -0.002356;
                }
              }
            } else {
              return 0.012727;
            }
          } else {
            return -0.025708;
          }
        }
      }
    })(f)
    // Tree 9
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.022346;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[0] <= 22.208049) {
                if (f[9] <= 0.000156) {
                  return -0.016825;
                } else {
                  return 0.002886;
                }
              } else {
                if (f[3] <= 0.001183) {
                  if (f[9] <= 0.000184) {
                    return 0.001557;
                  } else {
                    return -0.004742;
                  }
                } else {
                  if (f[14] <= 0.000076) {
                    return 0.009285;
                  } else {
                    return 0.000570;
                  }
                }
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.009818;
                } else {
                  return 0.022246;
                }
              } else {
                return -0.001993;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[16] <= 0.000325) {
                return -0.007870;
              } else {
                return 0.010119;
              }
            } else {
              return -0.024509;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[8] <= 0.000286) {
              return -0.006936;
            } else {
              return -0.022259;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006444;
            } else {
              return -0.012040;
            }
          }
        }
      }
    })(f)
    // Tree 10
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.021952;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[0] <= 22.208049) {
                if (f[9] <= 0.000156) {
                  return -0.016508;
                } else {
                  return 0.002829;
                }
              } else {
                if (f[3] <= 0.001183) {
                  if (f[12] <= 0.000247) {
                    return 0.000838;
                  } else {
                    return -0.007907;
                  }
                } else {
                  if (f[14] <= 0.000076) {
                    return 0.009102;
                  } else {
                    return 0.000558;
                  }
                }
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.009623;
                } else {
                  return 0.021813;
                }
              } else {
                return -0.001953;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[16] <= 0.000325) {
                return -0.007714;
              } else {
                return 0.009918;
              }
            } else {
              return -0.024045;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.024494;
            } else {
              return -0.002570;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006315;
            } else {
              return -0.011804;
            }
          }
        }
      }
    })(f)
    // Tree 11
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.021570;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.009074) {
                return -0.003330;
              } else {
                return 0.014243;
              }
            } else {
              if (f[9] <= 0.000160) {
                return -0.022236;
              } else {
                if (f[9] <= 0.000202) {
                  return 0.001672;
                } else {
                  return -0.014595;
                }
              }
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.013686;
            } else {
              if (f[12] <= 0.000247) {
                if (f[9] <= 0.000077) {
                  return 0.017094;
                } else {
                  if (f[4] <= 0.000000) {
                    return 0.001323;
                  } else {
                    return 0.006459;
                  }
                }
              } else {
                if (f[10] <= 0.000203) {
                  if (f[8] <= -0.000149) {
                    return 0.001980;
                  } else {
                    return -0.015623;
                  }
                } else {
                  if (f[16] <= 0.000032) {
                    return -0.000390;
                  } else {
                    return 0.012624;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[12] <= 0.000210) {
                if (f[16] <= 0.000406) {
                  if (f[9] <= 0.000163) {
                    return -0.004094;
                  } else {
                    return -0.018518;
                  }
                } else {
                  if (f[16] <= 0.000476) {
                    return 0.011143;
                  } else {
                    return -0.004611;
                  }
                }
              } else {
                if (f[15] <= 0.000185) {
                  return 0.011868;
                } else {
                  return -0.002882;
                }
              }
            } else {
              return 0.012416;
            }
          } else {
            return -0.024988;
          }
        }
      }
    })(f)
    // Tree 12
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.021199;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.016105;
            } else {
              return 0.002726;
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000184) {
                if (f[13] <= -0.000158) {
                  if (f[1] <= 0.005556) {
                    return -0.013095;
                  } else {
                    return -0.000124;
                  }
                } else {
                  if (f[8] <= 0.000293) {
                    return 0.003990;
                  } else {
                    return -0.001720;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.019413;
                } else {
                  if (f[8] <= 0.000449) {
                    return -0.002170;
                  } else {
                    return -0.017268;
                  }
                }
              }
            } else {
              if (f[1] <= 0.024599) {
                if (f[7] <= -0.000216) {
                  if (f[8] <= -0.000682) {
                    return 0.008306;
                  } else {
                    return -0.005065;
                  }
                } else {
                  if (f[7] <= -0.000074) {
                    return 0.024029;
                  } else {
                    return 0.011721;
                  }
                }
              } else {
                return -0.002553;
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            if (f[1] <= 0.018913) {
              return -0.011317;
            } else {
              return -0.019662;
            }
          } else {
            if (f[1] <= 0.031515) {
              return 0.010531;
            } else {
              if (f[8] <= 0.000720) {
                return -0.016506;
              } else {
                return 0.002112;
              }
            }
          }
        }
      }
    })(f)
    // Tree 13
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.020838;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000477) {
              if (f[16] <= -0.000900) {
                return 0.014252;
              } else {
                if (f[2] <= 0.013524) {
                  return -0.008210;
                } else {
                  return 0.006400;
                }
              }
            } else {
              if (f[9] <= 0.000157) {
                return -0.022385;
              } else {
                if (f[3] <= 0.001085) {
                  return -0.016300;
                } else {
                  return -0.002589;
                }
              }
            }
          } else {
            if (f[3] <= 0.001193) {
              if (f[12] <= 0.000247) {
                if (f[9] <= 0.000058) {
                  return -0.012999;
                } else {
                  if (f[9] <= 0.000184) {
                    return 0.004124;
                  } else {
                    return -0.002386;
                  }
                }
              } else {
                if (f[8] <= -0.000070) {
                  if (f[3] <= 0.000849) {
                    return 0.007084;
                  } else {
                    return -0.007935;
                  }
                } else {
                  if (f[10] <= 0.000140) {
                    return -0.017598;
                  } else {
                    return -0.005170;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000051) {
                if (f[6] <= -0.000046) {
                  return 0.008091;
                } else {
                  return 0.020452;
                }
              } else {
                if (f[14] <= 0.000210) {
                  return -0.002155;
                } else {
                  return 0.008277;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[12] <= 0.000210) {
                if (f[16] <= 0.000406) {
                  if (f[9] <= 0.000163) {
                    return -0.003956;
                  } else {
                    return -0.018048;
                  }
                } else {
                  if (f[16] <= 0.000476) {
                    return 0.010997;
                  } else {
                    return -0.004435;
                  }
                }
              } else {
                if (f[14] <= 0.000159) {
                  return 0.009419;
                } else {
                  return -0.002468;
                }
              }
            } else {
              return 0.012259;
            }
          } else {
            return -0.024461;
          }
        }
      }
    })(f)
    // Tree 14
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.020486;
      } else {
        if (f[8] <= 0.000293) {
          if (f[9] <= 0.000058) {
            return -0.013197;
          } else {
            if (f[9] <= 0.000077) {
              return 0.016615;
            } else {
              if (f[8] <= 0.000034) {
                if (f[9] <= 0.000151) {
                  if (f[3] <= 0.000870) {
                    return -0.002053;
                  } else {
                    return -0.022042;
                  }
                } else {
                  if (f[3] <= 0.000760) {
                    return -0.006305;
                  } else {
                    return 0.003750;
                  }
                }
              } else {
                if (f[3] <= 0.000452) {
                  if (f[1] <= 0.005095) {
                    return 0.026462;
                  } else {
                    return 0.000661;
                  }
                } else {
                  if (f[3] <= 0.001294) {
                    return 0.000764;
                  } else {
                    return 0.014971;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[12] <= 0.000210) {
                if (f[16] <= 0.000406) {
                  if (f[9] <= 0.000163) {
                    return -0.003877;
                  } else {
                    return -0.017703;
                  }
                } else {
                  if (f[16] <= 0.000476) {
                    return 0.010778;
                  } else {
                    return -0.004347;
                  }
                }
              } else {
                if (f[15] <= 0.000185) {
                  return 0.011576;
                } else {
                  return -0.002768;
                }
              }
            } else {
              return 0.012021;
            }
          } else {
            return -0.024035;
          }
        }
      }
    })(f)
    // Tree 15
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.020143;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[9] <= 0.000289) {
                if (f[12] <= 0.000241) {
                  if (f[0] <= 24.411221) {
                    return -0.007766;
                  } else {
                    return 0.001424;
                  }
                } else {
                  if (f[16] <= 0.000229) {
                    return -0.007482;
                  } else {
                    return 0.005729;
                  }
                }
              } else {
                return 0.012064;
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.009349;
                } else {
                  return 0.021320;
                }
              } else {
                return -0.001805;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[16] <= 0.000325) {
                return -0.007406;
              } else {
                return 0.009653;
              }
            } else {
              return -0.022957;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.023765;
            } else {
              return -0.002315;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006309;
            } else {
              return -0.011375;
            }
          }
        }
      }
    })(f)
    // Tree 16
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.016876;
      } else {
        if (f[0] <= 74.258966) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.000000) {
                return -0.005609;
              } else {
                return 0.016836;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.005499;
              } else {
                return -0.019933;
              }
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000184) {
                if (f[10] <= 0.000064) {
                  if (f[9] <= 0.000058) {
                    return -0.012048;
                  } else {
                    return 0.000781;
                  }
                } else {
                  if (f[0] <= 39.417024) {
                    return -0.006456;
                  } else {
                    return 0.007122;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.018552;
                } else {
                  if (f[7] <= -0.000063) {
                    return 0.001919;
                  } else {
                    return -0.005621;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000572) {
                if (f[7] <= -0.000216) {
                  return 0.000025;
                } else {
                  if (f[7] <= -0.000074) {
                    return 0.023381;
                  } else {
                    return 0.007665;
                  }
                }
              } else {
                return -0.003284;
              }
            }
          }
        } else {
          if (f[12] <= 0.000172) {
            if (f[7] <= 0.000388) {
              if (f[15] <= 0.000140) {
                return -0.009895;
              } else {
                return -0.021383;
              }
            } else {
              return -0.003753;
            }
          } else {
            return -0.000382;
          }
        }
      }
    })(f)
    // Tree 17
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.019586;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.015287;
            } else {
              return 0.002669;
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000184) {
                if (f[13] <= -0.000158) {
                  if (f[1] <= 0.005556) {
                    return -0.012621;
                  } else {
                    return -0.000106;
                  }
                } else {
                  if (f[8] <= 0.000293) {
                    return 0.003797;
                  } else {
                    return -0.001681;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.018553;
                } else {
                  if (f[8] <= 0.000449) {
                    return -0.002004;
                  } else {
                    return -0.016216;
                  }
                }
              }
            } else {
              if (f[1] <= 0.024599) {
                if (f[8] <= 0.000019) {
                  if (f[14] <= 0.000070) {
                    return 0.010264;
                  } else {
                    return 0.000422;
                  }
                } else {
                  return 0.021685;
                }
              } else {
                return -0.002457;
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            if (f[1] <= 0.018913) {
              return -0.010752;
            } else {
              return -0.018870;
            }
          } else {
            if (f[1] <= 0.031515) {
              return 0.010493;
            } else {
              if (f[8] <= 0.000720) {
                return -0.015802;
              } else {
                return 0.002172;
              }
            }
          }
        }
      }
    })(f)
    // Tree 18
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.019266;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[9] <= 0.000289) {
                if (f[12] <= 0.000241) {
                  if (f[0] <= 24.411221) {
                    return -0.007436;
                  } else {
                    return 0.001359;
                  }
                } else {
                  if (f[15] <= 0.000159) {
                    return -0.003840;
                  } else {
                    return -0.016248;
                  }
                }
              } else {
                return 0.011655;
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.009146;
                } else {
                  return 0.020864;
                }
              } else {
                return -0.001809;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[3] <= 0.000754) {
                return -0.010126;
              } else {
                return 0.007651;
              }
            } else {
              return -0.022316;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.022871;
            } else {
              return -0.002059;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006388;
            } else {
              return -0.010972;
            }
          }
        }
      }
    })(f)
    // Tree 19
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.016235;
      } else {
        if (f[1] <= 0.021958) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[1] <= -0.046367) {
                return 0.018160;
              } else {
                return -0.005458;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.005312;
              } else {
                return -0.019520;
              }
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000187) {
                if (f[9] <= 0.000058) {
                  return -0.012721;
                } else {
                  if (f[14] <= 0.000032) {
                    return -0.000029;
                  } else {
                    return 0.005325;
                  }
                }
              } else {
                if (f[1] <= -0.006356) {
                  if (f[9] <= 0.000240) {
                    return -0.000485;
                  } else {
                    return 0.016310;
                  }
                } else {
                  if (f[16] <= 0.000209) {
                    return -0.013574;
                  } else {
                    return -0.001760;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000057) {
                return 0.016408;
              } else {
                if (f[15] <= 0.000260) {
                  return -0.001217;
                } else {
                  return 0.010753;
                }
              }
            }
          }
        } else {
          if (f[15] <= 0.000140) {
            if (f[3] <= 0.000948) {
              return -0.010068;
            } else {
              if (f[1] <= 0.034766) {
                if (f[14] <= -0.000044) {
                  return 0.006330;
                } else {
                  return 0.019149;
                }
              } else {
                return -0.002683;
              }
            }
          } else {
            if (f[9] <= 0.000157) {
              if (f[9] <= 0.000132) {
                return -0.011041;
              } else {
                return 0.010283;
              }
            } else {
              if (f[16] <= 0.000381) {
                return -0.022217;
              } else {
                if (f[3] <= 0.001286) {
                  return -0.004993;
                } else {
                  return -0.014504;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 20
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.018698;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.014825;
            } else {
              return 0.002696;
            }
          } else {
            if (f[3] <= 0.001172) {
              if (f[9] <= 0.000184) {
                if (f[10] <= -0.000158) {
                  if (f[1] <= 0.005556) {
                    return -0.013067;
                  } else {
                    return 0.000000;
                  }
                } else {
                  if (f[12] <= 0.000152) {
                    return 0.000636;
                  } else {
                    return 0.006286;
                  }
                }
              } else {
                if (f[1] <= -0.006356) {
                  if (f[0] <= 50.746268) {
                    return -0.003590;
                  } else {
                    return 0.016665;
                  }
                } else {
                  if (f[9] <= 0.000245) {
                    return -0.006342;
                  } else {
                    return -0.017457;
                  }
                }
              }
            } else {
              if (f[12] <= 0.000323) {
                if (f[14] <= 0.000051) {
                  if (f[8] <= 0.000215) {
                    return 0.014685;
                  } else {
                    return 0.001735;
                  }
                } else {
                  if (f[0] <= 38.861331) {
                    return -0.003502;
                  } else {
                    return 0.006217;
                  }
                }
              } else {
                return -0.002659;
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            if (f[8] <= 0.000286) {
              return -0.010384;
            } else {
              return -0.018287;
            }
          } else {
            if (f[1] <= 0.031515) {
              return 0.010320;
            } else {
              if (f[8] <= 0.000720) {
                return -0.015275;
              } else {
                return 0.002249;
              }
            }
          }
        }
      }
    })(f)
    // Tree 21
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.018398;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.014555;
            } else {
              return 0.002642;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.014408;
            } else {
              if (f[10] <= -0.000057) {
                if (f[3] <= 0.001201) {
                  if (f[3] <= 0.000914) {
                    return -0.000641;
                  } else {
                    return -0.009427;
                  }
                } else {
                  if (f[2] <= 0.248717) {
                    return -0.002725;
                  } else {
                    return 0.013936;
                  }
                }
              } else {
                if (f[9] <= 0.000079) {
                  return 0.018157;
                } else {
                  if (f[15] <= 0.000421) {
                    return 0.002390;
                  } else {
                    return 0.011091;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[15] <= 0.000285) {
              if (f[3] <= 0.001033) {
                if (f[9] <= 0.000163) {
                  if (f[9] <= 0.000118) {
                    return -0.009939;
                  } else {
                    return -0.000460;
                  }
                } else {
                  return -0.016440;
                }
              } else {
                if (f[0] <= 71.031259) {
                  return 0.011443;
                } else {
                  if (f[8] <= 0.000575) {
                    return -0.011738;
                  } else {
                    return 0.001233;
                  }
                }
              }
            } else {
              if (f[0] <= 76.190476) {
                if (f[0] <= 64.745470) {
                  return -0.002798;
                } else {
                  if (f[1] <= 0.024358) {
                    return 0.023782;
                  } else {
                    return 0.004826;
                  }
                }
              } else {
                return -0.005886;
              }
            }
          } else {
            return -0.023132;
          }
        }
      }
    })(f)
    // Tree 22
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.018105;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.014291;
            } else {
              return 0.002590;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.014136;
            } else {
              if (f[10] <= -0.000057) {
                if (f[3] <= 0.001201) {
                  if (f[3] <= 0.000914) {
                    return -0.000628;
                  } else {
                    return -0.009241;
                  }
                } else {
                  if (f[2] <= 0.248717) {
                    return -0.002670;
                  } else {
                    return 0.013672;
                  }
                }
              } else {
                if (f[9] <= 0.000079) {
                  return 0.017815;
                } else {
                  if (f[15] <= 0.000421) {
                    return 0.002342;
                  } else {
                    return 0.010875;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[0] <= 58.407079) {
                if (f[12] <= 0.000165) {
                  if (f[10] <= 0.000006) {
                    return -0.007996;
                  } else {
                    return -0.018031;
                  }
                } else {
                  return -0.000738;
                }
              } else {
                if (f[0] <= 70.659446) {
                  if (f[3] <= 0.001029) {
                    return -0.000445;
                  } else {
                    return 0.011032;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.016887;
                  } else {
                    return -0.003095;
                  }
                }
              }
            } else {
              return 0.011823;
            }
          } else {
            return -0.022746;
          }
        }
      }
    })(f)
    // Tree 23
    (function(f) {
      if (f[7] <= -0.000503) {
        if (f[9] <= 0.000259) {
          if (f[14] <= -0.000323) {
            return 0.008943;
          } else {
            return -0.002912;
          }
        } else {
          return 0.021186;
        }
      } else {
        if (f[7] <= -0.000353) {
          if (f[9] <= 0.000160) {
            return -0.020061;
          } else {
            if (f[9] <= 0.000202) {
              return 0.002355;
            } else {
              return -0.014019;
            }
          }
        } else {
          if (f[0] <= 73.541565) {
            if (f[3] <= 0.001172) {
              if (f[9] <= 0.000184) {
                if (f[10] <= 0.000064) {
                  if (f[16] <= 0.000083) {
                    return 0.002133;
                  } else {
                    return -0.002819;
                  }
                } else {
                  if (f[12] <= 0.000127) {
                    return -0.000658;
                  } else {
                    return 0.008108;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.017657;
                } else {
                  if (f[7] <= 0.000069) {
                    return 0.000076;
                  } else {
                    return -0.007982;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000630) {
                if (f[16] <= 0.000255) {
                  if (f[7] <= -0.000101) {
                    return 0.010060;
                  } else {
                    return -0.001203;
                  }
                } else {
                  return 0.017043;
                }
              } else {
                return -0.003987;
              }
            }
          } else {
            if (f[9] <= 0.000177) {
              if (f[12] <= 0.000178) {
                if (f[7] <= 0.000424) {
                  if (f[10] <= 0.000013) {
                    return -0.017339;
                  } else {
                    return -0.006492;
                  }
                } else {
                  return 0.003776;
                }
              } else {
                return 0.007578;
              }
            } else {
              return -0.013809;
            }
          }
        }
      }
    })(f)
    // Tree 24
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.017602;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.013950;
            } else {
              return 0.002512;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.013900;
            } else {
              if (f[12] <= 0.000241) {
                if (f[9] <= 0.000077) {
                  return 0.015596;
                } else {
                  if (f[4] <= 0.000000) {
                    return 0.000837;
                  } else {
                    return 0.005932;
                  }
                }
              } else {
                if (f[9] <= 0.000284) {
                  if (f[16] <= 0.000236) {
                    return -0.006975;
                  } else {
                    return 0.005989;
                  }
                } else {
                  return 0.008981;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[0] <= 58.407079) {
                if (f[12] <= 0.000165) {
                  if (f[16] <= 0.000128) {
                    return -0.008332;
                  } else {
                    return -0.018264;
                  }
                } else {
                  return -0.000731;
                }
              } else {
                if (f[0] <= 70.659446) {
                  if (f[0] <= 65.823663) {
                    return -0.001851;
                  } else {
                    return 0.007120;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.016408;
                  } else {
                    return -0.002986;
                  }
                }
              }
            } else {
              return 0.011592;
            }
          } else {
            return -0.022286;
          }
        }
      }
    })(f)
    // Tree 25
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.015268;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[1] <= -0.046367) {
                return 0.017422;
              } else {
                return -0.005193;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.004785;
              } else {
                return -0.018871;
              }
            }
          } else {
            if (f[3] <= 0.001193) {
              if (f[9] <= 0.000184) {
                if (f[10] <= -0.000063) {
                  if (f[15] <= -0.000283) {
                    return 0.008234;
                  } else {
                    return -0.005454;
                  }
                } else {
                  if (f[9] <= 0.000058) {
                    return -0.011752;
                  } else {
                    return 0.005136;
                  }
                }
              } else {
                if (f[16] <= 0.000083) {
                  if (f[7] <= -0.000066) {
                    return -0.000760;
                  } else {
                    return -0.016577;
                  }
                } else {
                  if (f[1] <= -0.005632) {
                    return 0.015595;
                  } else {
                    return -0.001723;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000051) {
                if (f[6] <= -0.000046) {
                  return 0.006713;
                } else {
                  return 0.018837;
                }
              } else {
                if (f[14] <= 0.000210) {
                  return -0.002563;
                } else {
                  return 0.007262;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[16] <= 0.000406) {
                if (f[9] <= 0.000149) {
                  if (f[9] <= 0.000134) {
                    return -0.003902;
                  } else {
                    return 0.008747;
                  }
                } else {
                  if (f[6] <= 0.000081) {
                    return -0.002470;
                  } else {
                    return -0.021450;
                  }
                }
              } else {
                if (f[16] <= 0.000476) {
                  return 0.011648;
                } else {
                  if (f[20] <= 0.000000) {
                    return -0.007839;
                  } else {
                    return 0.003055;
                  }
                }
              }
            } else {
              return 0.011369;
            }
          } else {
            return -0.021924;
          }
        }
      }
    })(f)
    // Tree 26
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.014998;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.000000) {
                return -0.005530;
              } else {
                return 0.015699;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.004691;
              } else {
                return -0.018520;
              }
            }
          } else {
            if (f[3] <= 0.001193) {
              if (f[12] <= 0.000247) {
                if (f[9] <= 0.000058) {
                  return -0.011018;
                } else {
                  if (f[9] <= 0.000184) {
                    return 0.003631;
                  } else {
                    return -0.002109;
                  }
                }
              } else {
                if (f[8] <= -0.000070) {
                  if (f[3] <= 0.000849) {
                    return 0.007419;
                  } else {
                    return -0.007436;
                  }
                } else {
                  if (f[3] <= 0.000792) {
                    return -0.017342;
                  } else {
                    return -0.005775;
                  }
                }
              }
            } else {
              if (f[14] <= 0.000051) {
                if (f[6] <= -0.000046) {
                  return 0.006583;
                } else {
                  return 0.018501;
                }
              } else {
                if (f[14] <= 0.000210) {
                  return -0.002511;
                } else {
                  return 0.007121;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[12] <= 0.000210) {
                if (f[19] <= 0.000000) {
                  if (f[7] <= 0.000186) {
                    return 0.002495;
                  } else {
                    return -0.004542;
                  }
                } else {
                  return -0.013883;
                }
              } else {
                if (f[15] <= 0.000185) {
                  return 0.011618;
                } else {
                  return -0.002370;
                }
              }
            } else {
              return 0.011151;
            }
          } else {
            return -0.021572;
          }
        }
      }
    })(f)
    // Tree 27
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.014732;
      } else {
        if (f[0] <= 74.258966) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.000000) {
                return -0.005421;
              } else {
                return 0.015409;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.004599;
              } else {
                return -0.018178;
              }
            }
          } else {
            if (f[3] <= 0.001176) {
              if (f[9] <= 0.000184) {
                if (f[14] <= 0.000032) {
                  if (f[14] <= 0.000000) {
                    return 0.000853;
                  } else {
                    return -0.009603;
                  }
                } else {
                  if (f[16] <= -0.000266) {
                    return -0.007979;
                  } else {
                    return 0.005028;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.017201;
                } else {
                  if (f[5] <= 0.000000) {
                    return -0.005337;
                  } else {
                    return 0.002176;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000630) {
                if (f[14] <= 0.000076) {
                  if (f[6] <= 0.000010) {
                    return 0.006759;
                  } else {
                    return 0.023392;
                  }
                } else {
                  if (f[15] <= 0.000235) {
                    return -0.004649;
                  } else {
                    return 0.010132;
                  }
                }
              } else {
                return -0.004524;
              }
            }
          }
        } else {
          if (f[12] <= 0.000172) {
            if (f[7] <= 0.000388) {
              if (f[14] <= 0.000083) {
                return -0.008324;
              } else {
                return -0.021293;
              }
            } else {
              return -0.003036;
            }
          } else {
            return 0.000015;
          }
        }
      }
    })(f)
    // Tree 28
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.014473;
      } else {
        if (f[0] <= 74.258966) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.000000) {
                return -0.005314;
              } else {
                return 0.015126;
              }
            } else {
              if (f[16] <= -0.000394) {
                if (f[9] <= 0.000198) {
                  return -0.010401;
                } else {
                  return -0.022262;
                }
              } else {
                return -0.001961;
              }
            }
          } else {
            if (f[3] <= 0.001176) {
              if (f[9] <= 0.000184) {
                if (f[10] <= 0.000064) {
                  if (f[16] <= 0.000083) {
                    return 0.002049;
                  } else {
                    return -0.002878;
                  }
                } else {
                  if (f[0] <= 39.556504) {
                    return -0.005538;
                  } else {
                    return 0.006597;
                  }
                }
              } else {
                if (f[3] <= 0.000608) {
                  return -0.016877;
                } else {
                  if (f[5] <= 0.000000) {
                    return -0.005231;
                  } else {
                    return 0.002132;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000630) {
                if (f[14] <= 0.000076) {
                  if (f[6] <= 0.000010) {
                    return 0.006628;
                  } else {
                    return 0.022966;
                  }
                } else {
                  if (f[14] <= 0.000210) {
                    return -0.005569;
                  } else {
                    return 0.007004;
                  }
                }
              } else {
                return -0.004434;
              }
            }
          }
        } else {
          if (f[12] <= 0.000172) {
            if (f[7] <= 0.000388) {
              if (f[14] <= 0.000083) {
                return -0.008165;
              } else {
                return -0.020912;
              }
            } else {
              return -0.002976;
            }
          } else {
            return 0.000015;
          }
        }
      }
    })(f)
    // Tree 29
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.016538;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[9] <= 0.000289) {
                if (f[12] <= 0.000241) {
                  if (f[16] <= 0.000222) {
                    return 0.001707;
                  } else {
                    return -0.003684;
                  }
                } else {
                  if (f[15] <= 0.000159) {
                    return -0.003437;
                  } else {
                    return -0.015862;
                  }
                }
              } else {
                return 0.010618;
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.008724;
                } else {
                  return 0.020087;
                }
              } else {
                return -0.001678;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[3] <= 0.000754) {
                return -0.010059;
              } else {
                return 0.007243;
              }
            } else {
              return -0.021097;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.021351;
            } else {
              return -0.001431;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006837;
            } else {
              return -0.010070;
            }
          }
        }
      }
    })(f)
    // Tree 30
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.016282;
      } else {
        if (f[8] <= 0.000293) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000477) {
              if (f[16] <= -0.000900) {
                return 0.012683;
              } else {
                if (f[2] <= 0.013524) {
                  return -0.007138;
                } else {
                  return 0.005861;
                }
              }
            } else {
              if (f[16] <= -0.000394) {
                if (f[16] <= -0.000574) {
                  return -0.007866;
                } else {
                  return -0.021069;
                }
              } else {
                return -0.003470;
              }
            }
          } else {
            if (f[12] <= 0.000247) {
              if (f[3] <= 0.001250) {
                if (f[8] <= 0.000034) {
                  if (f[1] <= -0.007532) {
                    return 0.003331;
                  } else {
                    return -0.003948;
                  }
                } else {
                  if (f[3] <= 0.000898) {
                    return 0.006286;
                  } else {
                    return -0.005458;
                  }
                }
              } else {
                if (f[16] <= -0.000025) {
                  return 0.014848;
                } else {
                  if (f[12] <= 0.000159) {
                    return -0.003585;
                  } else {
                    return 0.012906;
                  }
                }
              }
            } else {
              if (f[10] <= 0.000203) {
                if (f[8] <= -0.000149) {
                  return 0.001823;
                } else {
                  if (f[1] <= 0.010926) {
                    return -0.020804;
                  } else {
                    return -0.005467;
                  }
                }
              } else {
                if (f[16] <= 0.000032) {
                  return -0.000639;
                } else {
                  return 0.010856;
                }
              }
            }
          }
        } else {
          if (f[10] <= 0.000096) {
            if (f[10] <= 0.000076) {
              if (f[2] <= 0.922839) {
                if (f[15] <= 0.000349) {
                  if (f[3] <= 0.001049) {
                    return -0.007111;
                  } else {
                    return 0.002467;
                  }
                } else {
                  return -0.017322;
                }
              } else {
                if (f[20] <= 0.000000) {
                  return 0.008765;
                } else {
                  return -0.000579;
                }
              }
            } else {
              return -0.014289;
            }
          } else {
            if (f[1] <= 0.018493) {
              return 0.008535;
            } else {
              if (f[15] <= 0.000178) {
                return 0.005775;
              } else {
                if (f[10] <= 0.000152) {
                  return -0.002906;
                } else {
                  return -0.014758;
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 31
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.016032;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[9] <= 0.000289) {
                if (f[12] <= 0.000241) {
                  if (f[16] <= 0.000222) {
                    return 0.001656;
                  } else {
                    return -0.003604;
                  }
                } else {
                  if (f[15] <= 0.000159) {
                    return -0.003283;
                  } else {
                    return -0.015502;
                  }
                }
              } else {
                return 0.010343;
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.008534;
                } else {
                  return 0.019666;
                }
              } else {
                return -0.001679;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[16] <= 0.000325) {
                return -0.007278;
              } else {
                return 0.009020;
              }
            } else {
              return -0.020626;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.020970;
            } else {
              return -0.001433;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006755;
            } else {
              return -0.009819;
            }
          }
        }
      }
    })(f)
    // Tree 32
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.015787;
      } else {
        if (f[0] <= 73.541565) {
          if (f[0] <= 22.208049) {
            if (f[3] <= 0.001414) {
              return -0.012568;
            } else {
              return 0.000434;
            }
          } else {
            if (f[3] <= 0.001172) {
              if (f[8] <= 0.000605) {
                if (f[3] <= 0.000914) {
                  if (f[14] <= 0.000032) {
                    return -0.000867;
                  } else {
                    return 0.004036;
                  }
                } else {
                  if (f[3] <= 0.000956) {
                    return -0.011116;
                  } else {
                    return -0.002016;
                  }
                }
              } else {
                return -0.011525;
              }
            } else {
              if (f[12] <= 0.000323) {
                if (f[14] <= 0.000051) {
                  if (f[8] <= 0.000215) {
                    return 0.013722;
                  } else {
                    return 0.000972;
                  }
                } else {
                  if (f[0] <= 38.861331) {
                    return -0.003939;
                  } else {
                    return 0.005901;
                  }
                }
              } else {
                return -0.003113;
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            if (f[8] <= 0.000286) {
              return -0.009439;
            } else {
              return -0.016963;
            }
          } else {
            if (f[1] <= 0.031515) {
              return 0.010862;
            } else {
              if (f[0] <= 78.524795) {
                return -0.017149;
              } else {
                return -0.000145;
              }
            }
          }
        }
      }
    })(f)
    // Tree 33
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.015545;
      } else {
        if (f[8] <= 0.000293) {
          if (f[9] <= 0.000058) {
            return -0.011194;
          } else {
            if (f[9] <= 0.000077) {
              return 0.015086;
            } else {
              if (f[8] <= 0.000034) {
                if (f[9] <= 0.000151) {
                  if (f[8] <= -0.000021) {
                    return -0.004543;
                  } else {
                    return -0.018814;
                  }
                } else {
                  if (f[10] <= -0.000152) {
                    return -0.005183;
                  } else {
                    return 0.003355;
                  }
                }
              } else {
                if (f[9] <= 0.000153) {
                  if (f[2] <= 0.719097) {
                    return 0.011052;
                  } else {
                    return 0.000942;
                  }
                } else {
                  if (f[14] <= 0.000095) {
                    return 0.003445;
                  } else {
                    return -0.005637;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[19] <= 0.000000) {
                if (f[10] <= -0.000096) {
                  return 0.008560;
                } else {
                  if (f[14] <= 0.000311) {
                    return -0.001552;
                  } else {
                    return -0.013216;
                  }
                }
              } else {
                return -0.011877;
              }
            } else {
              return 0.010943;
            }
          } else {
            return -0.020875;
          }
        }
      }
    })(f)
    // Tree 34
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.013474;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[7] <= -0.000353) {
                if (f[7] <= -0.000503) {
                  if (f[1] <= -0.046367) {
                    return 0.015926;
                  } else {
                    return -0.005040;
                  }
                } else {
                  if (f[15] <= -0.000318) {
                    return -0.004074;
                  } else {
                    return -0.017499;
                  }
                }
              } else {
                if (f[8] <= -0.000219) {
                  if (f[9] <= 0.000222) {
                    return 0.001172;
                  } else {
                    return 0.016238;
                  }
                } else {
                  if (f[8] <= -0.000131) {
                    return -0.008386;
                  } else {
                    return 0.000662;
                  }
                }
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.008350;
                } else {
                  return 0.019296;
                }
              } else {
                return -0.001593;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[3] <= 0.000754) {
                return -0.009707;
              } else {
                return 0.007173;
              }
            } else {
              return -0.020139;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[8] <= 0.000286) {
              return -0.004538;
            } else {
              return -0.018398;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006699;
            } else {
              return -0.009490;
            }
          }
        }
      }
    })(f)
    // Tree 35
    (function(f) {
      if (f[7] <= -0.000503) {
        if (f[9] <= 0.000259) {
          if (f[14] <= -0.000323) {
            return 0.008009;
          } else {
            return -0.004096;
          }
        } else {
          return 0.018933;
        }
      } else {
        if (f[7] <= -0.000353) {
          if (f[9] <= 0.000160) {
            return -0.018461;
          } else {
            if (f[9] <= 0.000202) {
              return 0.003437;
            } else {
              return -0.012700;
            }
          }
        } else {
          if (f[1] <= -0.007532) {
            if (f[9] <= 0.000105) {
              return 0.018149;
            } else {
              if (f[0] <= 50.746268) {
                if (f[3] <= 0.000826) {
                  if (f[9] <= 0.000176) {
                    return -0.002447;
                  } else {
                    return -0.016977;
                  }
                } else {
                  if (f[9] <= 0.000160) {
                    return -0.014746;
                  } else {
                    return 0.006929;
                  }
                }
              } else {
                return 0.016033;
              }
            }
          } else {
            if (f[9] <= 0.000245) {
              if (f[12] <= 0.000115) {
                if (f[0] <= 71.521082) {
                  if (f[9] <= 0.000185) {
                    return -0.000512;
                  } else {
                    return -0.014523;
                  }
                } else {
                  if (f[1] <= 0.026708) {
                    return -0.019356;
                  } else {
                    return -0.003492;
                  }
                }
              } else {
                if (f[12] <= 0.000128) {
                  if (f[15] <= 0.000127) {
                    return 0.017886;
                  } else {
                    return -0.000833;
                  }
                } else {
                  if (f[10] <= 0.000070) {
                    return -0.002135;
                  } else {
                    return 0.003439;
                  }
                }
              }
            } else {
              if (f[15] <= 0.000210) {
                return -0.001318;
              } else {
                return -0.021504;
              }
            }
          }
        }
      }
    })(f)
    // Tree 36
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.013075;
      } else {
        if (f[0] <= 74.258966) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[1] <= -0.046367) {
                return 0.015564;
              } else {
                return -0.005049;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.003837;
              } else {
                return -0.016999;
              }
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000187) {
                if (f[10] <= 0.000064) {
                  if (f[16] <= 0.000083) {
                    return 0.001745;
                  } else {
                    return -0.002765;
                  }
                } else {
                  if (f[0] <= 39.417024) {
                    return -0.007572;
                  } else {
                    return 0.006229;
                  }
                }
              } else {
                if (f[1] <= -0.006356) {
                  if (f[0] <= 50.746268) {
                    return -0.001488;
                  } else {
                    return 0.017263;
                  }
                } else {
                  if (f[3] <= 0.000992) {
                    return -0.011136;
                  } else {
                    return 0.001173;
                  }
                }
              }
            } else {
              if (f[1] <= 0.024599) {
                if (f[7] <= -0.000216) {
                  return -0.002162;
                } else {
                  if (f[7] <= -0.000074) {
                    return 0.021487;
                  } else {
                    return 0.009421;
                  }
                }
              } else {
                return -0.003082;
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            return -0.014347;
          } else {
            if (f[1] <= 0.031515) {
              return 0.010088;
            } else {
              if (f[0] <= 78.524795) {
                return -0.015957;
              } else {
                return -0.000028;
              }
            }
          }
        }
      }
    })(f)
    // Tree 37
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.012849;
      } else {
        if (f[8] <= 0.000293) {
          if (f[16] <= -0.000317) {
            if (f[9] <= 0.000252) {
              if (f[8] <= -0.000420) {
                if (f[7] <= -0.000503) {
                  return 0.001200;
                } else {
                  if (f[9] <= 0.000160) {
                    return -0.021299;
                  } else {
                    return -0.008949;
                  }
                }
              } else {
                if (f[6] <= -0.000099) {
                  if (f[17] <= 0.000000) {
                    return -0.001995;
                  } else {
                    return 0.011981;
                  }
                } else {
                  if (f[5] <= 0.000000) {
                    return -0.015958;
                  } else {
                    return -0.001020;
                  }
                }
              }
            } else {
              return 0.009658;
            }
          } else {
            if (f[1] <= -0.018546) {
              if (f[7] <= -0.000289) {
                return -0.003826;
              } else {
                if (f[12] <= 0.000184) {
                  return 0.020049;
                } else {
                  return 0.003161;
                }
              }
            } else {
              if (f[12] <= 0.000248) {
                if (f[8] <= 0.000050) {
                  if (f[1] <= -0.007532) {
                    return 0.003538;
                  } else {
                    return -0.003771;
                  }
                } else {
                  if (f[9] <= 0.000091) {
                    return -0.007370;
                  } else {
                    return 0.006130;
                  }
                }
              } else {
                if (f[16] <= 0.000209) {
                  if (f[2] <= 0.383355) {
                    return -0.002342;
                  } else {
                    return -0.018304;
                  }
                } else {
                  return 0.007036;
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[16] <= 0.000406) {
                if (f[9] <= 0.000149) {
                  if (f[9] <= 0.000134) {
                    return -0.003557;
                  } else {
                    return 0.008660;
                  }
                } else {
                  if (f[6] <= 0.000081) {
                    return -0.002138;
                  } else {
                    return -0.020694;
                  }
                }
              } else {
                if (f[16] <= 0.000476) {
                  return 0.011720;
                } else {
                  if (f[20] <= 0.000000) {
                    return -0.007080;
                  } else {
                    return 0.003424;
                  }
                }
              }
            } else {
              return 0.010723;
            }
          } else {
            return -0.020285;
          }
        }
      }
    })(f)
    // Tree 38
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.014609;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[0] <= 22.208049) {
                if (f[16] <= -0.000619) {
                  return 0.000074;
                } else {
                  return -0.012137;
                }
              } else {
                if (f[3] <= 0.001183) {
                  if (f[12] <= 0.000247) {
                    return 0.000634;
                  } else {
                    return -0.006129;
                  }
                } else {
                  if (f[14] <= 0.000083) {
                    return 0.007231;
                  } else {
                    return -0.000889;
                  }
                }
              }
            } else {
              if (f[0] <= 64.037248) {
                if (f[7] <= 0.000269) {
                  return 0.010368;
                } else {
                  return -0.003241;
                }
              } else {
                return 0.017036;
              }
            }
          } else {
            if (f[16] <= 0.000197) {
              return -0.019577;
            } else {
              if (f[6] <= 0.000196) {
                return 0.004151;
              } else {
                return -0.009160;
              }
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[12] <= 0.000153) {
              return -0.020005;
            } else {
              return -0.000824;
            }
          } else {
            if (f[14] <= 0.000095) {
              return 0.008909;
            } else {
              if (f[3] <= 0.001183) {
                return 0.000070;
              } else {
                return -0.010526;
              }
            }
          }
        }
      }
    })(f)
    // Tree 39
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.012500;
      } else {
        if (f[0] <= 74.258966) {
          if (f[7] <= -0.000353) {
            if (f[7] <= -0.000503) {
              if (f[2] <= 0.000000) {
                return -0.005413;
              } else {
                return 0.013836;
              }
            } else {
              if (f[15] <= -0.000318) {
                return -0.003627;
              } else {
                return -0.016548;
              }
            }
          } else {
            if (f[3] <= 0.001239) {
              if (f[9] <= 0.000187) {
                if (f[10] <= 0.000064) {
                  if (f[16] <= 0.000083) {
                    return 0.001710;
                  } else {
                    return -0.002721;
                  }
                } else {
                  if (f[0] <= 39.417024) {
                    return -0.007457;
                  } else {
                    return 0.006095;
                  }
                }
              } else {
                if (f[7] <= -0.000161) {
                  if (f[3] <= 0.000845) {
                    return -0.005782;
                  } else {
                    return 0.010764;
                  }
                } else {
                  if (f[20] <= 0.000000) {
                    return 0.001540;
                  } else {
                    return -0.011698;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000572) {
                if (f[7] <= -0.000216) {
                  return -0.001425;
                } else {
                  if (f[7] <= -0.000074) {
                    return 0.020528;
                  } else {
                    return 0.006312;
                  }
                }
              } else {
                return -0.003389;
              }
            }
          }
        } else {
          if (f[12] <= 0.000172) {
            if (f[7] <= 0.000388) {
              if (f[15] <= 0.000140) {
                return -0.006865;
              } else {
                return -0.018498;
              }
            } else {
              return -0.002329;
            }
          } else {
            return 0.000550;
          }
        }
      }
    })(f)
    // Tree 40
    (function(f) {
      if (f[1] <= -0.059127) {
        return 0.013978;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 24.411221) {
            if (f[9] <= 0.000160) {
              if (f[1] <= -0.025012) {
                return -0.020363;
              } else {
                return -0.001820;
              }
            } else {
              return 0.003451;
            }
          } else {
            if (f[12] <= 0.000241) {
              if (f[3] <= 0.001320) {
                if (f[6] <= 0.000008) {
                  if (f[6] <= -0.000011) {
                    return 0.001001;
                  } else {
                    return -0.009385;
                  }
                } else {
                  if (f[0] <= 70.170780) {
                    return 0.005514;
                  } else {
                    return -0.008863;
                  }
                }
              } else {
                if (f[14] <= 0.000076) {
                  return 0.015869;
                } else {
                  return 0.000811;
                }
              }
            } else {
              if (f[9] <= 0.000289) {
                if (f[10] <= 0.000203) {
                  if (f[8] <= -0.000070) {
                    return -0.002038;
                  } else {
                    return -0.013961;
                  }
                } else {
                  return 0.001905;
                }
              } else {
                return 0.010046;
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[0] <= 58.407079) {
                if (f[12] <= 0.000165) {
                  if (f[10] <= 0.000006) {
                    return -0.006962;
                  } else {
                    return -0.017048;
                  }
                } else {
                  return -0.000273;
                }
              } else {
                if (f[0] <= 70.659446) {
                  if (f[10] <= 0.000025) {
                    return 0.006758;
                  } else {
                    return -0.002228;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.015113;
                  } else {
                    return -0.002131;
                  }
                }
              }
            } else {
              return 0.010545;
            }
          } else {
            return -0.019872;
          }
        }
      }
    })(f)
    // Tree 41
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.012158;
      } else {
        if (f[0] <= 74.258966) {
          if (f[14] <= 0.000032) {
            if (f[3] <= 0.001454) {
              if (f[1] <= -0.027401) {
                if (f[0] <= 29.303605) {
                  return -0.014478;
                } else {
                  return -0.000985;
                }
              } else {
                if (f[3] <= 0.000773) {
                  if (f[0] <= 33.169310) {
                    return 0.005428;
                  } else {
                    return -0.004409;
                  }
                } else {
                  if (f[15] <= -0.000172) {
                    return 0.006755;
                  } else {
                    return -0.001302;
                  }
                }
              }
            } else {
              if (f[2] <= 0.259177) {
                return 0.002260;
              } else {
                return 0.011896;
              }
            }
          } else {
            if (f[3] <= 0.000717) {
              if (f[6] <= 0.000068) {
                if (f[15] <= 0.000013) {
                  return 0.001778;
                } else {
                  if (f[1] <= 0.003798) {
                    return 0.011890;
                  } else {
                    return 0.023680;
                  }
                }
              } else {
                if (f[12] <= 0.000076) {
                  return -0.015319;
                } else {
                  if (f[0] <= 65.472172) {
                    return 0.002936;
                  } else {
                    return 0.014415;
                  }
                }
              }
            } else {
              if (f[16] <= 0.000101) {
                if (f[16] <= -0.000006) {
                  if (f[16] <= -0.000286) {
                    return -0.005199;
                  } else {
                    return 0.005244;
                  }
                } else {
                  return -0.017921;
                }
              } else {
                if (f[1] <= -0.012787) {
                  return 0.015644;
                } else {
                  if (f[14] <= 0.000191) {
                    return -0.003676;
                  } else {
                    return 0.004360;
                  }
                }
              }
            }
          }
        } else {
          if (f[1] <= 0.025242) {
            return -0.013704;
          } else {
            if (f[1] <= 0.031515) {
              return 0.010083;
            } else {
              if (f[0] <= 78.524795) {
                return -0.015432;
              } else {
                return 0.000018;
              }
            }
          }
        }
      }
    })(f)
    // Tree 42
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.014008;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 22.208049) {
            if (f[9] <= 0.000156) {
              return -0.012881;
            } else {
              return 0.002646;
            }
          } else {
            if (f[9] <= 0.000058) {
              return -0.012897;
            } else {
              if (f[9] <= 0.000077) {
                return 0.014692;
              } else {
                if (f[14] <= -0.000450) {
                  return -0.008771;
                } else {
                  if (f[3] <= 0.001183) {
                    return 0.000702;
                  } else {
                    return 0.005568;
                  }
                }
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[0] <= 58.407079) {
                if (f[12] <= 0.000165) {
                  if (f[10] <= 0.000006) {
                    return -0.006808;
                  } else {
                    return -0.016729;
                  }
                } else {
                  return -0.000266;
                }
              } else {
                if (f[0] <= 70.659446) {
                  if (f[3] <= 0.001029) {
                    return -0.000180;
                  } else {
                    return 0.010419;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.014784;
                  } else {
                    return -0.002055;
                  }
                }
              }
            } else {
              return 0.010333;
            }
          } else {
            return -0.019564;
          }
        }
      }
    })(f)
    // Tree 43
    (function(f) {
      if (f[7] <= -0.000503) {
        if (f[9] <= 0.000259) {
          if (f[14] <= -0.000323) {
            return 0.007628;
          } else {
            return -0.004392;
          }
        } else {
          return 0.017615;
        }
      } else {
        if (f[7] <= -0.000353) {
          if (f[9] <= 0.000160) {
            return -0.017219;
          } else {
            if (f[9] <= 0.000202) {
              return 0.003852;
            } else {
              return -0.012268;
            }
          }
        } else {
          if (f[8] <= -0.000219) {
            if (f[9] <= 0.000222) {
              if (f[1] <= -0.008230) {
                if (f[7] <= -0.000237) {
                  if (f[6] <= -0.000164) {
                    return 0.005787;
                  } else {
                    return -0.008134;
                  }
                } else {
                  if (f[3] <= 0.000815) {
                    return 0.000869;
                  } else {
                    return 0.016320;
                  }
                }
              } else {
                return -0.015183;
              }
            } else {
              if (f[1] <= -0.033277) {
                return 0.004363;
              } else {
                return 0.022351;
              }
            }
          } else {
            if (f[9] <= 0.000187) {
              if (f[9] <= 0.000058) {
                return -0.012649;
              } else {
                if (f[0] <= 71.521082) {
                  if (f[8] <= -0.000143) {
                    return -0.006634;
                  } else {
                    return 0.002828;
                  }
                } else {
                  if (f[12] <= 0.000102) {
                    return -0.011545;
                  } else {
                    return 0.001174;
                  }
                }
              }
            } else {
              if (f[8] <= 0.000472) {
                if (f[3] <= 0.000672) {
                  return -0.019747;
                } else {
                  if (f[9] <= 0.000241) {
                    return 0.001732;
                  } else {
                    return -0.008375;
                  }
                }
              } else {
                return -0.018843;
              }
            }
          }
        }
      }
    })(f)
    // Tree 44
    (function(f) {
      if (f[1] <= -0.059127) {
        return 0.013360;
      } else {
        if (f[8] <= 0.000293) {
          if (f[0] <= 24.411221) {
            if (f[9] <= 0.000160) {
              if (f[9] <= 0.000129) {
                return -0.002853;
              } else {
                return -0.020975;
              }
            } else {
              return 0.003342;
            }
          } else {
            if (f[12] <= 0.000241) {
              if (f[3] <= 0.001320) {
                if (f[6] <= 0.000008) {
                  if (f[6] <= -0.000011) {
                    return 0.000993;
                  } else {
                    return -0.009162;
                  }
                } else {
                  if (f[16] <= 0.000222) {
                    return 0.007821;
                  } else {
                    return -0.002739;
                  }
                }
              } else {
                if (f[14] <= 0.000076) {
                  return 0.015366;
                } else {
                  return 0.000661;
                }
              }
            } else {
              if (f[16] <= 0.000375) {
                if (f[8] <= -0.000070) {
                  if (f[14] <= -0.000203) {
                    return 0.004768;
                  } else {
                    return -0.005459;
                  }
                } else {
                  if (f[3] <= 0.000761) {
                    return -0.020056;
                  } else {
                    return -0.006864;
                  }
                }
              } else {
                return 0.010363;
              }
            }
          }
        } else {
          if (f[9] <= 0.000216) {
            if (f[14] <= 0.000369) {
              if (f[0] <= 58.407079) {
                if (f[12] <= 0.000165) {
                  if (f[10] <= 0.000006) {
                    return -0.006715;
                  } else {
                    return -0.016444;
                  }
                } else {
                  return -0.000244;
                }
              } else {
                if (f[0] <= 70.659446) {
                  if (f[10] <= 0.000025) {
                    return 0.006537;
                  } else {
                    return -0.002247;
                  }
                } else {
                  if (f[14] <= -0.000000) {
                    return -0.014457;
                  } else {
                    return -0.001933;
                  }
                }
              }
            } else {
              return 0.010166;
            }
          } else {
            return -0.019155;
          }
        }
      }
    })(f)
    // Tree 45
    (function(f) {
      if (f[7] <= -0.000503) {
        if (f[9] <= 0.000259) {
          if (f[14] <= -0.000323) {
            return 0.007458;
          } else {
            return -0.004299;
          }
        } else {
          return 0.017207;
        }
      } else {
        if (f[7] <= -0.000353) {
          if (f[15] <= -0.000318) {
            return -0.002996;
          } else {
            if (f[14] <= -0.000121) {
              return -0.019255;
            } else {
              return -0.008123;
            }
          }
        } else {
          if (f[8] <= -0.000219) {
            if (f[9] <= 0.000222) {
              if (f[1] <= -0.008230) {
                if (f[2] <= 0.421967) {
                  if (f[8] <= -0.000278) {
                    return -0.002436;
                  } else {
                    return 0.010146;
                  }
                } else {
                  return 0.020589;
                }
              } else {
                return -0.014910;
              }
            } else {
              if (f[1] <= -0.033277) {
                return 0.004244;
              } else {
                return 0.021888;
              }
            }
          } else {
            if (f[9] <= 0.000187) {
              if (f[12] <= 0.000102) {
                if (f[16] <= -0.000191) {
                  return 0.008330;
                } else {
                  if (f[8] <= -0.000123) {
                    return -0.020626;
                  } else {
                    return -0.001861;
                  }
                }
              } else {
                if (f[12] <= 0.000298) {
                  if (f[14] <= 0.000032) {
                    return 0.000575;
                  } else {
                    return 0.006028;
                  }
                } else {
                  return -0.010010;
                }
              }
            } else {
              if (f[8] <= 0.000472) {
                if (f[3] <= 0.000672) {
                  return -0.019365;
                } else {
                  if (f[9] <= 0.000241) {
                    return 0.001707;
                  } else {
                    return -0.008196;
                  }
                }
              } else {
                return -0.018464;
              }
            }
          }
        }
      }
    })(f)
    // Tree 46
    (function(f) {
      if (f[8] <= -0.001050) {
        return 0.013328;
      } else {
        if (f[8] <= 0.000293) {
          if (f[12] <= 0.000241) {
            if (f[10] <= 0.000165) {
              if (f[8] <= 0.000050) {
                if (f[1] <= 0.007801) {
                  if (f[1] <= -0.007532) {
                    return 0.001240;
                  } else {
                    return -0.004942;
                  }
                } else {
                  return 0.012290;
                }
              } else {
                if (f[3] <= 0.000449) {
                  if (f[1] <= 0.005095) {
                    return 0.023623;
                  } else {
                    return 0.000046;
                  }
                } else {
                  if (f[3] <= 0.000518) {
                    return -0.014591;
                  } else {
                    return 0.003907;
                  }
                }
              }
            } else {
              return 0.012166;
            }
          } else {
            if (f[10] <= 0.000203) {
              if (f[8] <= -0.000149) {
                if (f[12] <= 0.000292) {
                  if (f[2] <= 0.216020) {
                    return -0.014269;
                  } else {
                    return 0.000585;
                  }
                } else {
                  if (f[1] <= -0.023816) {
                    return 0.000515;
                  } else {
                    return 0.011773;
                  }
                }
              } else {
                if (f[1] <= 0.010926) {
                  return -0.017653;
                } else {
                  return -0.003941;
                }
              }
            } else {
              if (f[12] <= 0.000318) {
                return 0.008251;
              } else {
                return -0.001707;
              }
            }
          }
        } else {
          if (f[1] <= 0.037706) {
            if (f[1] <= 0.034147) {
              if (f[12] <= 0.000140) {
                if (f[8] <= 0.000400) {
                  if (f[3] <= 0.000572) {
                    return 0.000897;
                  } else {
                    return -0.015482;
                  }
                } else {
                  if (f[3] <= 0.000729) {
                    return -0.011488;
                  } else {
                    return 0.005414;
                  }
                }
              } else {
                if (f[8] <= 0.000472) {
                  if (f[10] <= 0.000051) {
                    return -0.003526;
                  } else {
                    return 0.010356;
                  }
                } else {
                  if (f[14] <= 0.000248) {
                    return 0.004272;
                  } else {
                    return -0.015376;
                  }
                }
              }
            } else {
              return -0.014744;
            }
          } else {
            if (f[3] <= 0.001359) {
              return 0.013109;
            } else {
              return -0.007391;
            }
          }
        }
      }
    })(f)
    // Tree 47
    (function(f) {
      if (f[7] <= -0.000503) {
        if (f[9] <= 0.000259) {
          if (f[14] <= -0.000323) {
            return 0.007235;
          } else {
            return -0.004250;
          }
        } else {
          return 0.016859;
        }
      } else {
        if (f[7] <= -0.000353) {
          if (f[9] <= 0.000160) {
            return -0.016690;
          } else {
            if (f[9] <= 0.000202) {
              return 0.003861;
            } else {
              return -0.011900;
            }
          }
        } else {
          if (f[0] <= 33.169310) {
            if (f[0] <= 29.303605) {
              if (f[6] <= -0.000077) {
                return 0.010290;
              } else {
                return -0.009896;
              }
            } else {
              if (f[1] <= -0.015917) {
                return 0.017650;
              } else {
                return 0.007727;
              }
            }
          } else {
            if (f[0] <= 74.258966) {
              if (f[14] <= 0.000025) {
                if (f[9] <= 0.000259) {
                  if (f[14] <= 0.000000) {
                    return -0.001425;
                  } else {
                    return -0.011267;
                  }
                } else {
                  return 0.014274;
                }
              } else {
                if (f[9] <= 0.000250) {
                  if (f[1] <= 0.022179) {
                    return 0.004211;
                  } else {
                    return -0.002925;
                  }
                } else {
                  if (f[1] <= -0.006854) {
                    return 0.000000;
                  } else {
                    return -0.015965;
                  }
                }
              }
            } else {
              if (f[1] <= 0.025242) {
                return -0.013311;
              } else {
                if (f[1] <= 0.031515) {
                  return 0.009968;
                } else {
                  if (f[9] <= 0.000156) {
                    return 0.002469;
                  } else {
                    return -0.012480;
                  }
                }
              }
            }
          }
        }
      }
    })(f)
    // Tree 48
    (function(f) {
      if (f[16] <= -0.001004) {
        return 0.011218;
      } else {
        if (f[16] <= 0.000761) {
          if (f[8] <= 0.000308) {
            if (f[7] <= 0.000218) {
              if (f[7] <= 0.000183) {
                if (f[2] <= 0.842406) {
                  if (f[8] <= 0.000034) {
                    return -0.000969;
                  } else {
                    return 0.003056;
                  }
                } else {
                  return 0.012480;
                }
              } else {
                return -0.011225;
              }
            } else {
              if (f[10] <= 0.000051) {
                return 0.000000;
              } else {
                return 0.018798;
              }
            }
          } else {
            if (f[9] <= 0.000216) {
              if (f[12] <= 0.000146) {
                if (f[3] <= 0.001128) {
                  if (f[9] <= 0.000160) {
                    return -0.003625;
                  } else {
                    return -0.015217;
                  }
                } else {
                  return 0.004173;
                }
              } else {
                if (f[8] <= 0.000423) {
                  if (f[7] <= 0.000227) {
                    return 0.000258;
                  } else {
                    return 0.018620;
                  }
                } else {
                  if (f[9] <= 0.000175) {
                    return 0.006180;
                  } else {
                    return -0.014239;
                  }
                }
              }
            } else {
              return -0.020674;
            }
          }
        } else {
          return -0.008695;
        }
      }
    })(f)
    // Tree 49
    (function(f) {
      if (f[1] <= -0.059127) {
        return 0.012666;
      } else {
        if (f[0] <= 74.258966) {
          if (f[8] <= 0.000472) {
            if (f[6] <= 0.000185) {
              if (f[0] <= 24.411221) {
                if (f[9] <= 0.000160) {
                  if (f[9] <= 0.000129) {
                    return -0.002675;
                  } else {
                    return -0.020526;
                  }
                } else {
                  return 0.003267;
                }
              } else {
                if (f[9] <= 0.000289) {
                  if (f[14] <= -0.000466) {
                    return -0.008520;
                  } else {
                    return 0.000424;
                  }
                } else {
                  return 0.012065;
                }
              }
            } else {
              if (f[9] <= 0.000237) {
                if (f[0] <= 63.820528) {
                  return 0.007459;
                } else {
                  return 0.018104;
                }
              } else {
                return -0.001169;
              }
            }
          } else {
            if (f[9] <= 0.000179) {
              if (f[3] <= 0.000754) {
                return -0.009414;
              } else {
                return 0.007024;
              }
            } else {
              return -0.018439;
            }
          }
        } else {
          if (f[8] <= 0.000507) {
            if (f[8] <= 0.000286) {
              return -0.003541;
            } else {
              return -0.016831;
            }
          } else {
            if (f[9] <= 0.000156) {
              return 0.006869;
            } else {
              return -0.008514;
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
      if (f[9] <= 0.000114) {
        if (f[0] <= 29.951768) {
          return -0.069907;
        } else {
          if (f[20] <= 0.000000) {
            if (f[12] <= 0.000051) {
              return 0.040229;
            } else {
              return -0.006771;
            }
          } else {
            if (f[9] <= 0.000100) {
              return -0.050079;
            } else {
              return 0.001390;
            }
          }
        }
      } else {
        if (f[8] <= 0.000093) {
          if (f[9] <= 0.000204) {
            if (f[21] <= 0.601769) {
              return 0.010460;
            } else {
              return 0.056314;
            }
          } else {
            if (f[8] <= -0.000227) {
              return -0.001156;
            } else {
              return -0.066335;
            }
          }
        } else {
          if (f[8] <= 0.000310) {
            if (f[21] <= 0.534163) {
              return 0.085740;
            } else {
              return 0.035094;
            }
          } else {
            return 0.010649;
          }
        }
      }
    })(f)
    // Meta Tree 1
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[0] <= 29.951768) {
          return -0.071593;
        } else {
          if (f[20] <= 0.000000) {
            if (f[12] <= 0.000051) {
              return 0.033137;
            } else {
              return -0.011526;
            }
          } else {
            if (f[2] <= 0.650530) {
              return 0.011091;
            } else {
              return -0.052001;
            }
          }
        }
      } else {
        if (f[8] <= 0.000093) {
          if (f[9] <= 0.000172) {
            if (f[13] <= 0.000006) {
              return 0.033694;
            } else {
              return -0.005325;
            }
          } else {
            if (f[1] <= -0.003045) {
              return -0.002743;
            } else {
              return -0.067032;
            }
          }
        } else {
          if (f[8] <= 0.000310) {
            if (f[21] <= 0.534163) {
              return 0.076501;
            } else {
              return 0.028254;
            }
          } else {
            return 0.005023;
          }
        }
      }
    })(f)
    // Meta Tree 2
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[21] <= 0.523167) {
          if (f[8] <= -0.000034) {
            if (f[8] <= -0.000139) {
              return -0.041525;
            } else {
              return -0.089910;
            }
          } else {
            if (f[15] <= 0.000127) {
              return 0.007758;
            } else {
              return -0.043619;
            }
          }
        } else {
          if (f[7] <= 0.000040) {
            if (f[16] <= -0.000025) {
              return 0.006663;
            } else {
              return 0.064085;
            }
          } else {
            if (f[8] <= 0.000087) {
              return -0.064442;
            } else {
              return -0.005590;
            }
          }
        }
      } else {
        if (f[8] <= 0.000093) {
          if (f[9] <= 0.000204) {
            if (f[16] <= -0.000542) {
              return -0.044226;
            } else {
              return 0.016863;
            }
          } else {
            if (f[8] <= -0.000227) {
              return -0.005955;
            } else {
              return -0.066489;
            }
          }
        } else {
          if (f[8] <= 0.000310) {
            if (f[21] <= 0.534163) {
              return 0.073029;
            } else {
              return 0.026861;
            }
          } else {
            return 0.004772;
          }
        }
      }
    })(f)
    // Meta Tree 3
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.041668;
      } else {
        if (f[10] <= 0.000019) {
          if (f[1] <= 0.003496) {
            if (f[14] <= -0.000114) {
              return -0.002559;
            } else {
              return 0.030129;
            }
          } else {
            if (f[16] <= -0.000032) {
              return -0.051106;
            } else {
              return 0.002298;
            }
          }
        } else {
          if (f[10] <= 0.000095) {
            if (f[16] <= -0.000181) {
              return 0.010493;
            } else {
              return -0.030261;
            }
          } else {
            if (f[19] <= 0.000000) {
              return 0.004458;
            } else {
              return 0.045418;
            }
          }
        }
      }
    })(f)
    // Meta Tree 4
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[0] <= 29.951768) {
          return -0.066799;
        } else {
          if (f[20] <= 0.000000) {
            if (f[0] <= 74.661605) {
              return -0.003025;
            } else {
              return 0.050030;
            }
          } else {
            if (f[2] <= 0.650530) {
              return 0.010260;
            } else {
              return -0.048216;
            }
          }
        }
      } else {
        if (f[8] <= 0.000093) {
          if (f[9] <= 0.000204) {
            if (f[21] <= 0.601769) {
              return 0.003674;
            } else {
              return 0.047484;
            }
          } else {
            if (f[8] <= -0.000227) {
              return -0.005121;
            } else {
              return -0.063938;
            }
          }
        } else {
          if (f[8] <= 0.000310) {
            if (f[21] <= 0.491946) {
              return 0.073763;
            } else {
              return 0.029612;
            }
          } else {
            return 0.004699;
          }
        }
      }
    })(f)
    // Meta Tree 5
    (function(f) {
      if (f[0] <= 25.291683) {
        return -0.042155;
      } else {
        if (f[21] <= 0.601769) {
          if (f[14] <= 0.000241) {
            if (f[8] <= 0.000389) {
              return -0.001488;
            } else {
              return -0.037101;
            }
          } else {
            if (f[21] <= 0.386704) {
              return 0.056835;
            } else {
              return -0.000561;
            }
          }
        } else {
          if (f[15] <= 0.000032) {
            if (f[6] <= -0.000156) {
              return -0.010263;
            } else {
              return 0.055502;
            }
          } else {
            if (f[3] <= 0.000664) {
              return -0.022514;
            } else {
              return 0.037651;
            }
          }
        }
      }
    })(f)
    // Meta Tree 6
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[0] <= 29.951768) {
          return -0.062736;
        } else {
          if (f[20] <= 0.000000) {
            if (f[12] <= 0.000051) {
              return 0.030373;
            } else {
              return -0.010209;
            }
          } else {
            if (f[9] <= 0.000100) {
              return -0.047291;
            } else {
              return 0.000338;
            }
          }
        }
      } else {
        if (f[3] <= 0.001231) {
          if (f[21] <= 0.620425) {
            if (f[21] <= 0.478418) {
              return 0.023126;
            } else {
              return -0.006721;
            }
          } else {
            if (f[15] <= 0.000013) {
              return 0.073897;
            } else {
              return 0.034423;
            }
          }
        } else {
          if (f[12] <= 0.000203) {
            return 0.002387;
          } else {
            return -0.042392;
          }
        }
      }
    })(f)
    // Meta Tree 7
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[12] <= 0.000171) {
          if (f[16] <= 0.000448) {
            if (f[12] <= 0.000146) {
              return -0.009538;
            } else {
              return -0.043980;
            }
          } else {
            return 0.037217;
          }
        } else {
          if (f[3] <= 0.000631) {
            return 0.057265;
          } else {
            if (f[8] <= -0.000096) {
              return -0.023157;
            } else {
              return 0.016381;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.066408;
        } else {
          if (f[2] <= 0.585844) {
            if (f[1] <= -0.037766) {
              return -0.033869;
            } else {
              return 0.042417;
            }
          } else {
            if (f[8] <= 0.000087) {
              return -0.042566;
            } else {
              return 0.013120;
            }
          }
        }
      }
    })(f)
    // Meta Tree 8
    (function(f) {
      if (f[0] <= 25.291683) {
        return -0.037903;
      } else {
        if (f[7] <= 0.000036) {
          if (f[0] <= 52.042829) {
            if (f[10] <= 0.000114) {
              return -0.000078;
            } else {
              return 0.044515;
            }
          } else {
            if (f[8] <= 0.000003) {
              return 0.009465;
            } else {
              return 0.058300;
            }
          }
        } else {
          if (f[12] <= 0.000178) {
            if (f[3] <= 0.000742) {
              return -0.024763;
            } else {
              return 0.015472;
            }
          } else {
            if (f[7] <= 0.000170) {
              return 0.066590;
            } else {
              return -0.002753;
            }
          }
        }
      }
    })(f)
    // Meta Tree 9
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[13] <= -0.000117) {
          return -0.063949;
        } else {
          if (f[13] <= 0.000019) {
            if (f[13] <= 0.000000) {
              return -0.005435;
            } else {
              return 0.044136;
            }
          } else {
            if (f[13] <= 0.000063) {
              return -0.057202;
            } else {
              return -0.006478;
            }
          }
        }
      } else {
        if (f[16] <= 0.000114) {
          if (f[9] <= 0.000204) {
            if (f[16] <= -0.000542) {
              return -0.040865;
            } else {
              return 0.014617;
            }
          } else {
            if (f[14] <= -0.000184) {
              return 0.013521;
            } else {
              return -0.061869;
            }
          }
        } else {
          if (f[12] <= 0.000108) {
            return 0.056147;
          } else {
            if (f[9] <= 0.000196) {
              return -0.013343;
            } else {
              return 0.040167;
            }
          }
        }
      }
    })(f)
    // Meta Tree 10
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[0] <= 29.951768) {
          return -0.058858;
        } else {
          if (f[20] <= 0.000000) {
            if (f[12] <= 0.000051) {
              return 0.028130;
            } else {
              return -0.008637;
            }
          } else {
            if (f[2] <= 0.650530) {
              return 0.010713;
            } else {
              return -0.042309;
            }
          }
        }
      } else {
        if (f[9] <= 0.000140) {
          if (f[12] <= 0.000196) {
            if (f[12] <= 0.000095) {
              return 0.030139;
            } else {
              return -0.005222;
            }
          } else {
            return 0.077795;
          }
        } else {
          if (f[9] <= 0.000151) {
            if (f[10] <= 0.000019) {
              return -0.010955;
            } else {
              return -0.063898;
            }
          } else {
            if (f[8] <= 0.000093) {
              return -0.003226;
            } else {
              return 0.036939;
            }
          }
        }
      }
    })(f)
    // Meta Tree 11
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[2] <= 0.091910) {
          return -0.059788;
        } else {
          if (f[10] <= 0.000019) {
            if (f[10] <= 0.000000) {
              return -0.005266;
            } else {
              return 0.045153;
            }
          } else {
            if (f[10] <= 0.000063) {
              return -0.054011;
            } else {
              return -0.005298;
            }
          }
        }
      } else {
        if (f[16] <= 0.000114) {
          if (f[9] <= 0.000204) {
            if (f[16] <= -0.000542) {
              return -0.039317;
            } else {
              return 0.013559;
            }
          } else {
            if (f[14] <= -0.000184) {
              return 0.012833;
            } else {
              return -0.059088;
            }
          }
        } else {
          if (f[16] <= 0.000292) {
            if (f[2] <= 0.626664) {
              return 0.025901;
            } else {
              return 0.059247;
            }
          } else {
            if (f[21] <= 0.491946) {
              return 0.036803;
            } else {
              return -0.039357;
            }
          }
        }
      }
    })(f)
    // Meta Tree 12
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[9] <= 0.000112) {
          if (f[6] <= -0.000055) {
            return -0.056654;
          } else {
            if (f[14] <= -0.000089) {
              return 0.037147;
            } else {
              return -0.015215;
            }
          }
        } else {
          if (f[21] <= 0.478418) {
            if (f[3] <= 0.000523) {
              return 0.062842;
            } else {
              return 0.004191;
            }
          } else {
            if (f[10] <= 0.000064) {
              return 0.002915;
            } else {
              return -0.043970;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.061653;
        } else {
          if (f[3] <= 0.000656) {
            if (f[7] <= 0.000049) {
              return 0.020081;
            } else {
              return -0.032652;
            }
          } else {
            if (f[1] <= -0.037766) {
              return -0.029983;
            } else {
              return 0.056251;
            }
          }
        }
      }
    })(f)
    // Meta Tree 13
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[9] <= 0.000112) {
          if (f[6] <= -0.000055) {
            return -0.054286;
          } else {
            if (f[20] <= 0.000000) {
              return 0.001670;
            } else {
              return -0.033659;
            }
          }
        } else {
          if (f[21] <= 0.478418) {
            if (f[3] <= 0.000523) {
              return 0.060047;
            } else {
              return 0.003983;
            }
          } else {
            if (f[10] <= 0.000064) {
              return 0.002769;
            } else {
              return -0.041761;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.059039;
        } else {
          if (f[3] <= 0.000656) {
            if (f[6] <= 0.000040) {
              return 0.016807;
            } else {
              return -0.032335;
            }
          } else {
            if (f[1] <= -0.022001) {
              return -0.011557;
            } else {
              return 0.067435;
            }
          }
        }
      }
    })(f)
    // Meta Tree 14
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[9] <= 0.000114) {
          if (f[14] <= -0.000133) {
            return -0.061043;
          } else {
            if (f[14] <= -0.000089) {
              return 0.041575;
            } else {
              return -0.015567;
            }
          }
        } else {
          if (f[9] <= 0.000127) {
            if (f[12] <= 0.000152) {
              return 0.008994;
            } else {
              return 0.064272;
            }
          } else {
            if (f[14] <= 0.000225) {
              return -0.008556;
            } else {
              return 0.029105;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.056616;
        } else {
          if (f[15] <= 0.000044) {
            if (f[6] <= -0.000156) {
              return -0.012025;
            } else {
              return 0.035582;
            }
          } else {
            if (f[15] <= 0.000108) {
              return -0.052181;
            } else {
              return 0.007979;
            }
          }
        }
      }
    })(f)
    // Meta Tree 15
    (function(f) {
      if (f[0] <= 25.291683) {
        return -0.032886;
      } else {
        if (f[9] <= 0.000106) {
          if (f[7] <= 0.000040) {
            if (f[21] <= 0.497102) {
              return -0.040133;
            } else {
              return 0.034924;
            }
          } else {
            if (f[21] <= 0.400589) {
              return 0.000360;
            } else {
              return -0.034684;
            }
          }
        } else {
          if (f[8] <= 0.000057) {
            if (f[13] <= 0.000006) {
              return 0.010731;
            } else {
              return -0.011667;
            }
          } else {
            if (f[21] <= 0.625772) {
              return 0.016494;
            } else {
              return 0.070348;
            }
          }
        }
      }
    })(f)
    // Meta Tree 16
    (function(f) {
      if (f[0] <= 25.291683) {
        return -0.031412;
      } else {
        if (f[9] <= 0.000106) {
          if (f[7] <= 0.000040) {
            if (f[6] <= -0.000057) {
              return -0.046763;
            } else {
              return 0.021389;
            }
          } else {
            if (f[8] <= 0.000087) {
              return -0.055231;
            } else {
              return -0.011635;
            }
          }
        } else {
          if (f[8] <= 0.000057) {
            if (f[1] <= -0.009805) {
              return 0.012793;
            } else {
              return -0.011059;
            }
          } else {
            if (f[1] <= 0.021307) {
              return 0.035278;
            } else {
              return -0.011456;
            }
          }
        }
      }
    })(f)
    // Meta Tree 17
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[0] <= 24.260355) {
          return -0.049193;
        } else {
          if (f[12] <= 0.000171) {
            if (f[16] <= 0.000448) {
              return -0.009394;
            } else {
              return 0.036366;
            }
          } else {
            if (f[3] <= 0.000631) {
              return 0.052114;
            } else {
              return -0.001966;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.054059;
        } else {
          if (f[1] <= 0.008346) {
            if (f[1] <= -0.037766) {
              return -0.026960;
            } else {
              return 0.019603;
            }
          } else {
            return -0.034108;
          }
        }
      }
    })(f)
    // Meta Tree 18
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[13] <= -0.000117) {
          return -0.055539;
        } else {
          if (f[13] <= 0.000019) {
            if (f[13] <= 0.000000) {
              return -0.003765;
            } else {
              return 0.039303;
            }
          } else {
            if (f[13] <= 0.000063) {
              return -0.049688;
            } else {
              return -0.002341;
            }
          }
        }
      } else {
        if (f[16] <= 0.000143) {
          if (f[9] <= 0.000204) {
            if (f[12] <= 0.000190) {
              return -0.001031;
            } else {
              return 0.031349;
            }
          } else {
            if (f[16] <= -0.000396) {
              return 0.015986;
            } else {
              return -0.051830;
            }
          }
        } else {
          if (f[16] <= 0.000292) {
            if (f[21] <= 0.474667) {
              return 0.026475;
            } else {
              return 0.065677;
            }
          } else {
            if (f[21] <= 0.491946) {
              return 0.033240;
            } else {
              return -0.038938;
            }
          }
        }
      }
    })(f)
    // Meta Tree 19
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[0] <= 24.260355) {
          return -0.047102;
        } else {
          if (f[8] <= -0.000551) {
            return 0.037961;
          } else {
            if (f[21] <= 0.407502) {
              return 0.007625;
            } else {
              return -0.010342;
            }
          }
        }
      } else {
        if (f[6] <= 0.000040) {
          if (f[1] <= 0.003571) {
            if (f[1] <= -0.015244) {
              return -0.004170;
            } else {
              return 0.060258;
            }
          } else {
            return -0.016541;
          }
        } else {
          if (f[3] <= 0.000461) {
            return -0.032401;
          } else {
            return 0.025381;
          }
        }
      }
    })(f)
    // Meta Tree 20
    (function(f) {
      if (f[9] <= 0.000114) {
        if (f[2] <= 0.091910) {
          return -0.054798;
        } else {
          if (f[10] <= 0.000019) {
            if (f[0] <= 63.174039) {
              return 0.019006;
            } else {
              return -0.019638;
            }
          } else {
            if (f[10] <= 0.000063) {
              return -0.047346;
            } else {
              return -0.001862;
            }
          }
        }
      } else {
        if (f[9] <= 0.000140) {
          if (f[3] <= 0.000461) {
            return -0.009299;
          } else {
            if (f[1] <= -0.020522) {
              return -0.004644;
            } else {
              return 0.044853;
            }
          }
        } else {
          if (f[9] <= 0.000151) {
            if (f[1] <= -0.003157) {
              return -0.012540;
            } else {
              return -0.064794;
            }
          } else {
            if (f[9] <= 0.000172) {
              return 0.034398;
            } else {
              return -0.003865;
            }
          }
        }
      }
    })(f)
    // Meta Tree 21
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[7] <= 0.000334) {
          if (f[8] <= 0.000389) {
            if (f[1] <= 0.008557) {
              return -0.006756;
            } else {
              return 0.016112;
            }
          } else {
            if (f[1] <= 0.025188) {
              return -0.057376;
            } else {
              return -0.003448;
            }
          }
        } else {
          return 0.032404;
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.050253;
        } else {
          if (f[3] <= 0.000656) {
            if (f[7] <= 0.000049) {
              return 0.014827;
            } else {
              return -0.028222;
            }
          } else {
            if (f[1] <= -0.037766) {
              return -0.025601;
            } else {
              return 0.048550;
            }
          }
        }
      }
    })(f)
    // Meta Tree 22
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.030400;
      } else {
        if (f[9] <= 0.000109) {
          if (f[20] <= 0.000000) {
            if (f[12] <= 0.000070) {
              return 0.014179;
            } else {
              return -0.013160;
            }
          } else {
            if (f[7] <= 0.000265) {
              return -0.041543;
            } else {
              return -0.000207;
            }
          }
        } else {
          if (f[0] <= 65.452333) {
            if (f[21] <= 0.691245) {
              return 0.006609;
            } else {
              return -0.034711;
            }
          } else {
            return 0.043925;
          }
        }
      }
    })(f)
    // Meta Tree 23
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[8] <= -0.000551) {
          return 0.028517;
        } else {
          if (f[1] <= -0.024790) {
            return -0.049364;
          } else {
            if (f[21] <= 0.407502) {
              return 0.006579;
            } else {
              return -0.008939;
            }
          }
        }
      } else {
        if (f[7] <= 0.000047) {
          if (f[7] <= -0.000220) {
            if (f[6] <= -0.000211) {
              return 0.006668;
            } else {
              return -0.030533;
            }
          } else {
            if (f[9] <= 0.000139) {
              return 0.033199;
            } else {
              return 0.068293;
            }
          }
        } else {
          if (f[8] <= 0.000087) {
            return -0.050655;
          } else {
            return 0.019866;
          }
        }
      }
    })(f)
    // Meta Tree 24
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[0] <= 24.260355) {
          return -0.044341;
        } else {
          if (f[10] <= 0.000152) {
            if (f[10] <= 0.000006) {
              return 0.003447;
            } else {
              return -0.015392;
            }
          } else {
            if (f[20] <= 0.000000) {
              return 0.042230;
            } else {
              return 0.005359;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.047351;
        } else {
          if (f[1] <= 0.008346) {
            if (f[15] <= 0.000044) {
              return 0.024592;
            } else {
              return -0.007893;
            }
          } else {
            return -0.033397;
          }
        }
      }
    })(f)
    // Meta Tree 25
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.028769;
      } else {
        if (f[9] <= 0.000109) {
          if (f[20] <= 0.000000) {
            if (f[9] <= 0.000075) {
              return 0.020335;
            } else {
              return -0.007626;
            }
          } else {
            if (f[7] <= 0.000265) {
              return -0.039871;
            } else {
              return -0.000023;
            }
          }
        } else {
          if (f[9] <= 0.000208) {
            if (f[1] <= 0.012754) {
              return 0.008320;
            } else {
              return 0.054723;
            }
          } else {
            if (f[16] <= 0.000063) {
              return -0.049846;
            } else {
              return 0.015013;
            }
          }
        }
      }
    })(f)
    // Meta Tree 26
    (function(f) {
      if (f[7] <= 0.000334) {
        if (f[8] <= 0.000433) {
          if (f[15] <= 0.000241) {
            if (f[15] <= 0.000203) {
              return 0.000299;
            } else {
              return 0.052464;
            }
          } else {
            if (f[10] <= 0.000022) {
              return 0.009529;
            } else {
              return -0.043368;
            }
          }
        } else {
          if (f[7] <= 0.000265) {
            return -0.052522;
          } else {
            return -0.013962;
          }
        }
      } else {
        return 0.032037;
      }
    })(f)
    // Meta Tree 27
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[0] <= 77.174820) {
          if (f[9] <= 0.000112) {
            if (f[3] <= 0.000543) {
              return -0.004441;
            } else {
              return -0.035995;
            }
          } else {
            if (f[21] <= 0.460700) {
              return 0.012939;
            } else {
              return -0.008006;
            }
          }
        } else {
          return 0.027954;
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.045660;
        } else {
          if (f[3] <= 0.000656) {
            if (f[15] <= -0.000044) {
              return 0.024710;
            } else {
              return -0.018733;
            }
          } else {
            if (f[7] <= -0.000081) {
              return -0.002011;
            } else {
              return 0.069093;
            }
          }
        }
      }
    })(f)
    // Meta Tree 28
    (function(f) {
      if (f[3] <= 0.000248) {
        if (f[8] <= 0.000013) {
          return 0.039216;
        } else {
          return -0.002114;
        }
      } else {
        if (f[9] <= 0.000090) {
          if (f[0] <= 53.509621) {
            return -0.052954;
          } else {
            if (f[3] <= 0.000362) {
              return 0.038489;
            } else {
              return -0.022723;
            }
          }
        } else {
          if (f[12] <= 0.000076) {
            if (f[10] <= 0.000019) {
              return 0.029466;
            } else {
              return -0.013560;
            }
          } else {
            if (f[9] <= 0.000116) {
              return -0.025577;
            } else {
              return 0.004541;
            }
          }
        }
      }
    })(f)
    // Meta Tree 29
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.027794;
      } else {
        if (f[3] <= 0.001377) {
          if (f[3] <= 0.000960) {
            if (f[10] <= -0.000102) {
              return -0.022636;
            } else {
              return 0.002623;
            }
          } else {
            if (f[15] <= -0.000032) {
              return -0.014118;
            } else {
              return 0.059424;
            }
          }
        } else {
          return -0.032334;
        }
      }
    })(f)
    // Meta Tree 30
    (function(f) {
      if (f[12] <= 0.000171) {
        if (f[7] <= -0.000241) {
          if (f[20] <= 0.000000) {
            return -0.071404;
          } else {
            return -0.006665;
          }
        } else {
          if (f[10] <= 0.000019) {
            if (f[8] <= -0.000206) {
              return 0.042539;
            } else {
              return 0.002910;
            }
          } else {
            if (f[10] <= 0.000044) {
              return -0.040244;
            } else {
              return -0.003630;
            }
          }
        }
      } else {
        if (f[3] <= 0.000631) {
          if (f[21] <= 0.514183) {
            return 0.061316;
          } else {
            return 0.009063;
          }
        } else {
          if (f[12] <= 0.000210) {
            if (f[10] <= 0.000051) {
              return 0.052840;
            } else {
              return -0.007851;
            }
          } else {
            if (f[10] <= 0.000165) {
              return -0.023436;
            } else {
              return 0.012953;
            }
          }
        }
      }
    })(f)
    // Meta Tree 31
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[8] <= -0.000551) {
          return 0.027559;
        } else {
          if (f[0] <= 27.475490) {
            return -0.041533;
          } else {
            if (f[7] <= -0.000264) {
              return -0.041582;
            } else {
              return -0.000960;
            }
          }
        }
      } else {
        if (f[1] <= 0.008346) {
          if (f[8] <= 0.000087) {
            if (f[7] <= 0.000047) {
              return 0.021445;
            } else {
              return -0.044503;
            }
          } else {
            return 0.052750;
          }
        } else {
          return -0.026588;
        }
      }
    })(f)
    // Meta Tree 32
    (function(f) {
      if (f[3] <= 0.000248) {
        if (f[1] <= -0.000327) {
          return 0.056712;
        } else {
          return -0.009028;
        }
      } else {
        if (f[9] <= 0.000090) {
          if (f[0] <= 53.509621) {
            return -0.050480;
          } else {
            if (f[7] <= 0.000036) {
              return 0.051047;
            } else {
              return -0.017608;
            }
          }
        } else {
          if (f[0] <= 25.291683) {
            return -0.029738;
          } else {
            if (f[10] <= 0.000019) {
              return 0.011296;
            } else {
              return -0.005141;
            }
          }
        }
      }
    })(f)
    // Meta Tree 33
    (function(f) {
      if (f[7] <= 0.000334) {
        if (f[15] <= 0.000241) {
          if (f[15] <= 0.000203) {
            if (f[15] <= 0.000178) {
              return 0.000600;
            } else {
              return -0.038922;
            }
          } else {
            return 0.043753;
          }
        } else {
          if (f[0] <= 65.452333) {
            if (f[2] <= 0.761501) {
              return -0.016148;
            } else {
              return -0.063005;
            }
          } else {
            return 0.009776;
          }
        }
      } else {
        return 0.030852;
      }
    })(f)
    // Meta Tree 34
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[10] <= -0.000181) {
          return 0.027125;
        } else {
          if (f[10] <= -0.000140) {
            return -0.055710;
          } else {
            if (f[6] <= 0.000132) {
              return -0.005005;
            } else {
              return 0.017325;
            }
          }
        }
      } else {
        if (f[1] <= 0.008718) {
          if (f[6] <= 0.000035) {
            if (f[7] <= -0.000220) {
              return -0.006783;
            } else {
              return 0.048825;
            }
          } else {
            if (f[8] <= 0.000082) {
              return -0.027679;
            } else {
              return 0.029127;
            }
          }
        } else {
          return -0.027248;
        }
      }
    })(f)
    // Meta Tree 35
    (function(f) {
      if (f[12] <= 0.000171) {
        if (f[7] <= -0.000241) {
          if (f[1] <= -0.026180) {
            return -0.007183;
          } else {
            return -0.059919;
          }
        } else {
          if (f[10] <= 0.000019) {
            if (f[8] <= -0.000244) {
              return 0.043612;
            } else {
              return 0.002750;
            }
          } else {
            if (f[10] <= 0.000044) {
              return -0.037863;
            } else {
              return -0.003283;
            }
          }
        }
      } else {
        if (f[12] <= 0.000260) {
          if (f[3] <= 0.001157) {
            if (f[7] <= -0.000003) {
              return 0.010632;
            } else {
              return 0.052603;
            }
          } else {
            return -0.025110;
          }
        } else {
          if (f[10] <= -0.000238) {
            return 0.026016;
          } else {
            if (f[10] <= 0.000165) {
              return -0.051414;
            } else {
              return -0.002228;
            }
          }
        }
      }
    })(f)
    // Meta Tree 36
    (function(f) {
      if (f[12] <= 0.000171) {
        if (f[7] <= -0.000241) {
          if (f[12] <= 0.000095) {
            return -0.061000;
          } else {
            return -0.009939;
          }
        } else {
          if (f[10] <= 0.000019) {
            if (f[12] <= 0.000133) {
              return 0.011753;
            } else {
              return -0.029985;
            }
          } else {
            if (f[10] <= 0.000095) {
              return -0.020565;
            } else {
              return 0.018741;
            }
          }
        }
      } else {
        if (f[12] <= 0.000260) {
          if (f[9] <= 0.000207) {
            if (f[12] <= 0.000191) {
              return 0.001267;
            } else {
              return 0.049474;
            }
          } else {
            return -0.009270;
          }
        } else {
          if (f[10] <= -0.000238) {
            return 0.024719;
          } else {
            if (f[10] <= 0.000165) {
              return -0.049038;
            } else {
              return -0.002116;
            }
          }
        }
      }
    })(f)
    // Meta Tree 37
    (function(f) {
      if (f[3] <= 0.000248) {
        if (f[1] <= -0.000327) {
          return 0.054149;
        } else {
          return -0.008082;
        }
      } else {
        if (f[9] <= 0.000109) {
          if (f[10] <= 0.000025) {
            if (f[10] <= 0.000000) {
              return -0.010345;
            } else {
              return 0.025590;
            }
          } else {
            if (f[10] <= 0.000063) {
              return -0.057511;
            } else {
              return -0.014087;
            }
          }
        } else {
          if (f[0] <= 65.452333) {
            if (f[0] <= 59.026268) {
              return 0.004304;
            } else {
              return -0.020024;
            }
          } else {
            return 0.040017;
          }
        }
      }
    })(f)
    // Meta Tree 38
    (function(f) {
      if (f[7] <= 0.000334) {
        if (f[15] <= 0.000241) {
          if (f[15] <= 0.000203) {
            if (f[15] <= 0.000178) {
              return 0.000683;
            } else {
              return -0.037345;
            }
          } else {
            return 0.041596;
          }
        } else {
          if (f[0] <= 65.452333) {
            if (f[2] <= 0.761501) {
              return -0.015542;
            } else {
              return -0.059762;
            }
          } else {
            return 0.007868;
          }
        }
      } else {
        return 0.028246;
      }
    })(f)
    // Meta Tree 39
    (function(f) {
      if (f[12] <= 0.000171) {
        if (f[14] <= -0.000133) {
          if (f[8] <= -0.000262) {
            return -0.051076;
          } else {
            if (f[14] <= -0.000184) {
              return 0.029778;
            } else {
              return -0.031566;
            }
          }
        } else {
          if (f[3] <= 0.000248) {
            if (f[12] <= 0.000070) {
              return -0.002618;
            } else {
              return 0.062196;
            }
          } else {
            if (f[8] <= -0.000262) {
              return 0.024228;
            } else {
              return -0.007029;
            }
          }
        }
      } else {
        if (f[3] <= 0.000631) {
          if (f[21] <= 0.514183) {
            return 0.056823;
          } else {
            return 0.006263;
          }
        } else {
          if (f[12] <= 0.000210) {
            if (f[13] <= 0.000051) {
              return 0.049472;
            } else {
              return -0.009039;
            }
          } else {
            if (f[20] <= -0.000000) {
              return -0.029143;
            } else {
              return 0.005146;
            }
          }
        }
      }
    })(f)
    // Meta Tree 40
    (function(f) {
      if (f[9] <= 0.000115) {
        if (f[10] <= -0.000117) {
          return -0.052969;
        } else {
          if (f[20] <= 0.000000) {
            if (f[0] <= 74.661605) {
              return -0.000775;
            } else {
              return 0.043481;
            }
          } else {
            if (f[9] <= 0.000100) {
              return -0.037667;
            } else {
              return 0.010570;
            }
          }
        }
      } else {
        if (f[9] <= 0.000120) {
          return 0.047399;
        } else {
          if (f[8] <= 0.000093) {
            if (f[2] <= 0.144787) {
              return 0.019499;
            } else {
              return -0.009993;
            }
          } else {
            if (f[1] <= 0.021307) {
              return 0.034039;
            } else {
              return -0.012592;
            }
          }
        }
      }
    })(f)
    // Meta Tree 41
    (function(f) {
      if (f[0] <= 48.699324) {
        if (f[0] <= 46.947648) {
          if (f[12] <= 0.000114) {
            if (f[14] <= -0.000041) {
              return -0.027493;
            } else {
              return 0.004751;
            }
          } else {
            if (f[14] <= -0.000343) {
              return -0.024064;
            } else {
              return 0.017705;
            }
          }
        } else {
          return -0.057703;
        }
      } else {
        if (f[0] <= 56.087416) {
          if (f[8] <= 0.000172) {
            if (f[9] <= 0.000077) {
              return 0.050753;
            } else {
              return 0.002696;
            }
          } else {
            return 0.072880;
          }
        } else {
          if (f[20] <= 0.000000) {
            if (f[1] <= 0.013526) {
              return -0.003183;
            } else {
              return 0.037909;
            }
          } else {
            if (f[8] <= 0.000597) {
              return -0.043283;
            } else {
              return 0.029297;
            }
          }
        }
      }
    })(f)
    // Meta Tree 42
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[8] <= -0.000551) {
          return 0.027306;
        } else {
          if (f[0] <= 27.475490) {
            return -0.037519;
          } else {
            if (f[21] <= 0.407502) {
              return 0.008350;
            } else {
              return -0.008399;
            }
          }
        }
      } else {
        if (f[1] <= 0.008346) {
          if (f[14] <= 0.000146) {
            if (f[14] <= 0.000082) {
              return 0.014020;
            } else {
              return 0.058169;
            }
          } else {
            return -0.020737;
          }
        } else {
          return -0.024859;
        }
      }
    })(f)
    // Meta Tree 43
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.024595;
      } else {
        if (f[16] <= -0.000396) {
          if (f[7] <= -0.000236) {
            return 0.005907;
          } else {
            return 0.047706;
          }
        } else {
          if (f[0] <= 48.699324) {
            if (f[0] <= 46.947648) {
              return -0.001295;
            } else {
              return -0.054954;
            }
          } else {
            if (f[0] <= 56.087416) {
              return 0.023169;
            } else {
              return -0.004491;
            }
          }
        }
      }
    })(f)
    // Meta Tree 44
    (function(f) {
      if (f[9] <= 0.000115) {
        if (f[2] <= 0.091910) {
          return -0.048549;
        } else {
          if (f[14] <= -0.000089) {
            if (f[14] <= -0.000127) {
              return -0.011489;
            } else {
              return 0.047556;
            }
          } else {
            if (f[14] <= -0.000032) {
              return -0.046841;
            } else {
              return -0.001103;
            }
          }
        }
      } else {
        if (f[9] <= 0.000120) {
          return 0.045881;
        } else {
          if (f[8] <= 0.000093) {
            if (f[2] <= 0.144787) {
              return 0.018799;
            } else {
              return -0.009618;
            }
          } else {
            if (f[1] <= 0.021307) {
              return 0.032439;
            } else {
              return -0.012146;
            }
          }
        }
      }
    })(f)
    // Meta Tree 45
    (function(f) {
      if (f[21] <= 0.601769) {
        if (f[8] <= -0.000551) {
          return 0.025858;
        } else {
          if (f[0] <= 27.475490) {
            return -0.036068;
          } else {
            if (f[7] <= -0.000264) {
              return -0.039155;
            } else {
              return -0.000811;
            }
          }
        }
      } else {
        if (f[12] <= 0.000038) {
          return 0.042604;
        } else {
          if (f[3] <= 0.000656) {
            if (f[15] <= -0.000044) {
              return 0.022222;
            } else {
              return -0.018171;
            }
          } else {
            if (f[7] <= -0.000081) {
              return -0.002007;
            } else {
              return 0.064360;
            }
          }
        }
      }
    })(f)
    // Meta Tree 46
    (function(f) {
      if (f[16] <= -0.000584) {
        return -0.023281;
      } else {
        if (f[16] <= -0.000396) {
          if (f[7] <= -0.000236) {
            return 0.005600;
          } else {
            return 0.045489;
          }
        } else {
          if (f[0] <= 48.699324) {
            if (f[0] <= 46.947648) {
              return -0.001099;
            } else {
              return -0.052502;
            }
          } else {
            if (f[0] <= 56.087416) {
              return 0.022026;
            } else {
              return -0.004327;
            }
          }
        }
      }
    })(f)
    // Meta Tree 47
    (function(f) {
      if (f[10] <= -0.000200) {
        return 0.022303;
      } else {
        if (f[16] <= -0.000584) {
          return -0.044262;
        } else {
          if (f[10] <= -0.000102) {
            if (f[15] <= -0.000063) {
              return -0.040148;
            } else {
              return 0.007570;
            }
          } else {
            if (f[10] <= -0.000063) {
              return 0.027028;
            } else {
              return -0.000414;
            }
          }
        }
      }
    })(f)
    // Meta Tree 48
    (function(f) {
      if (f[12] <= 0.000171) {
        if (f[6] <= -0.000130) {
          if (f[3] <= 0.000859) {
            return -0.011955;
          } else {
            return -0.056561;
          }
        } else {
          if (f[7] <= 0.000017) {
            if (f[21] <= 0.538068) {
              return -0.005799;
            } else {
              return 0.036574;
            }
          } else {
            if (f[0] <= 48.699324) {
              return -0.054696;
            } else {
              return -0.003767;
            }
          }
        }
      } else {
        if (f[3] <= 0.000631) {
          if (f[21] <= 0.514183) {
            return 0.054509;
          } else {
            return 0.005995;
          }
        } else {
          if (f[12] <= 0.000210) {
            if (f[13] <= 0.000051) {
              return 0.047083;
            } else {
              return -0.008476;
            }
          } else {
            if (f[20] <= -0.000000) {
              return -0.027758;
            } else {
              return 0.004688;
            }
          }
        }
      }
    })(f)
    // Meta Tree 49
    (function(f) {
      if (f[10] <= 0.000210) {
        if (f[10] <= 0.000019) {
          if (f[21] <= 0.513576) {
            if (f[9] <= 0.000090) {
              return -0.024361;
            } else {
              return 0.002457;
            }
          } else {
            if (f[1] <= 0.008718) {
              return 0.022048;
            } else {
              return -0.040251;
            }
          }
        } else {
          if (f[6] <= -0.000076) {
            return 0.033901;
          } else {
            if (f[6] <= -0.000026) {
              return -0.054816;
            } else {
              return -0.005657;
            }
          }
        }
      } else {
        return 0.024164;
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
