const DEFAULT_ARTISTS = [
  {
    name: "___",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["___"]
  },
  {
    name: "Rui Shido \u7D2B\u5802\u308B\u3044",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNOS-112", "SNOS-167", "SNOS-122"]
  },
  {
    name: "Mikuru Hinagata",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNOS-129", "SNOS-125", "SNOS-080"]
  },
  {
    name: "Mai Fujisaki",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["IPZZ-807"]
  },
  {
    name: "Ouka Rin",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["NMSL-025"]
  },
  {
    name: "Kagura Momoka",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-729", "SONE-647", "SNOS-107", "SONE-368", "SONE-319", "SONE-166", "SONE-131"]
  },
  {
    name: "Himari Kosaka",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["LULU-387", "AVSA-344", "NACR-891", "HOMA-147", "SMOK-012", "CEMD-676", "DVAJ-692"]
  },
  {
    name: "Ran Aoi \u611B\u751F\u3089\u3093",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["DLDSS-475", "DLDSS-457", "DLDSS-442", "DLDSS-434", "BGSD-422"]
  },
  {
    name: "Anri Okita",
    cover: "WANZ-265",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SOE-823", "HND-128", "MIDE-213", "WANZ-265", "PPPD-288", "MIDE-095", "WANZ-062", "SOE-636"]
  },
  {
    name: "Goddess Jun",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["FNS-150", "FSDSS-906", "FSDSS-959", "FNS-014"]
  },
  {
    name: "Ran Kikuno",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["FPRE-189", "FPRE-101", "FPRE-168", "FPRE-036"]
  },
  {
    name: "Nanami Tina",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUR-588", "JUR-615", "JUR-466", "ACHJ-075"]
  },
  {
    name: "Yu Tano",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-675", "SONE-470", "SONE-713", "SONE-585", "SIVR-418", "SONE-840", "SONE-929", "SNOS-094", "SONE-631"]
  },
  {
    name: "Ryoka Sakura \u685C\u308A\u3087\u3046\u304B",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ACHJ-064"]
  },
  {
    name: "Mika Azuma",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-963", "SONE-963", "SNOS-024"]
  },
  {
    name: "Takarada Monami",
    cover: "",
    url: "",
    // Custom cover
    compilations: ["MDBK-244"],
    mainWorks: ["GVH-684", "UZU-026", "FPRE-149", "NACR-882", "FPRE-125", "FPRE-115", "SMOK-004", "JYMA-053", "WAWA-022", "AEGE-022", "GMJK-008", "MVSD-499"]
  },
  {
    name: "Shino Mayu",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-807", "OFJE-697", "EBWH-276", "SONE-964", "SONE-894", "SONE-634", "SONE-494", "FWAY-040"]
  },
  {
    name: "Kiyomiya Nina | Toa Kiyomiya",
    cover: "",
    url: "",
    // Custom cover
    compilations: ["MKCK-398", "MKCK-388", "MKCK-414"],
    mainWorks: ["EBWH-304", "EBWH-298", "MIMK-262", "PFES-115", "EBWH-281", "EBWH-265", "EBWH-261", "EBWH-248", "REBDB-950", "EBWH-243", "EBWH-230", "EBWH-226", "EBWH-226", "EBWH-219", "EBWH-205", "MIDA-190", "EBWH-200", "EBWH-192", "EBWH-183", "MKCK-377", "EBWH-165", "EBWH-155", "EBWH-144", "EBVR-102", "EBWH-135", "EBWH-123", "FWAY-028", "EBWH-119", "EBWH-104", "EBWH-087", "EBWH-071"]
  },
  {
    name: "Konomi Nagisa",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ABW-182", "ABW-126", "ABW-086", "ABW-075", "CHN-196", "ABW-042"]
  },
  {
    name: "Ai Kano",
    cover: "",
    url: "",
    // Custom cover
    compilations: ["JUMS-137"],
    mainWorks: ["JUQ-106", "JUQ-763", "JUQ-963", "JUL-542", "ACHJ-035", "JUVR-155", "JUQ-848", "ACHJ-059", "JUR-125", "JUQ-931", "JUQ-794", "JUQ-686", "ACHJ-035", "JUQ-132", "JUVR-155", "JUQ-071", "JUSD-958", "JUL-804", "URE-081", "JUL-612", "REBD-543", "JUL-404", "JUL-439", "JUL-473"]
  },
  {
    name: "Himari Himari",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["MIDV-964"]
  },
  {
    name: "Washio Mei",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SSIS-950", "SONE-310", "SONE-542", "SONE-641", "SONE-985"]
  },
  {
    name: "Alice",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["HUNTB-216"]
  },
  {
    name: "Futaba Sara",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["VEC-749", "BBTU-108", "NACT-029", "KAM-268", "MVSD-657", "JUR-345", "MIDV-811", "JUR-013", "FWAY-016", "NACT-007", "420HHL-142"]
  },
  {
    name: "Mei Satsuki",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUR-586"]
  },
  {
    name: "Rea Marumo",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["HOMA-157", "HALT-072", "SVCAO-022", "PPPE-368", "SAVR-809", "NMSL-016", "MAAN-01-078", "MAAN-01-076", "URVRSP-430"]
  },
  {
    name: "Misao Oguri",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ROYD-283", "DASS-735", "DASS-723", "REBDB-952"]
  },
  {
    name: "Ai Sayama",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUFE-090", "WAAA-440", "JUFE-101", "JUY-717", "MEYD-414", "MEYD-576", "MEYD-652", "MEYD-978", "PPPD-394", "PPPD-603", "WAAA-403"]
  },
  {
    name: "Aika Yumeno",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNIS-413", "SNIS-477", "SNIS-659", "SONE-874", "SSNI-304"]
  },
  {
    name: "Aiko Kimura",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-828", "SONE-866", "SNOS-066", "SNOS-041", "SIVR-458", "SONE-788", "SONE-783"]
  },
  {
    name: "Anna Morikawa",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["PRED-018", "200GANA-1680"]
  },
  {
    name: "Rara Anzai | Rion | Shion Utsunomiya",
    cover: "SSNI-727",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["OAE-095", "OAE-100", "OAE-104", "MMND-128", "OAE-105", "OAE-123", "TUKAHB-33397", "OAE-134", "OAE-166", "SIVR-010", "SIVR-008", "AVOP-004", "SNIS-009", "SNIS-027", "SNIS-048", "SNIS-070", "SNIS-091", "SNIS-110", "SNIS-129", "SNIS-147", "SNIS-166", "SNIS-205", "SOE-992", "ONSD-850", "ONSD-899", "SNIS-517", "SNIS-539", "SNIS-561", "SNIS-594", "SNIS-603", "SNIS-623", "SNIS-640", "SNIS-656", "SNIS-673", "SNIS-692", "SNIS-712", "SNIS-731", "SNIS-752", "SNIS-774", "SNIS-787", "SNIS-811", "SNIS-824", "SNIS-895", "SNIS-918", "SNIS-939", "SNIS-963", "SNIS-985", "SSNI-008", "SSNI-029", "SSNI-053", "EBOD-609", "SSNI-100", "SSNI-126", "SSNI-151", "SSNI-177", "SSNI-204", "SSNI-228", "SSNI-241", "SSNI-268", "SSNI-290", "OFJE-104", "OFJE-144", "OFJE-255", "SSIS-025", "SSIS-050", "SSIS-103", "SSIS-124", "SSIS-136", "SSIS-172", "SSIS-203", "SSIS-232", "SSIS-262", "SSIS-269", "SSIS-357", "SSNI-643", "SSNI-671", "SSNI-700", "SSNI-727", "SSNI-752", "SSNI-777", "SSNI-799", "SSNI-822", "OFJE-279", "OFJE-288", "OFJE-354", "OFJE-410"]
  },
  {
    name: "Aoi",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNIS-977"]
  },
  {
    name: "Asahi Mizuno",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUL-442", "JUL-546", "NITR-114"]
  },
  {
    name: "Asuna Kawai",
    cover: "VENU-662",
    url: "",
    // Custom cover
    compilations: ["THU-032"],
    mainWorks: ["ABF-119", "ABF-268", "ABF-278", "ABW-268", "PPT-128", "ABF-084", "PPX-009", "ABW-175", "ABW-256", "ABF-321", "ABF-310"]
  },
  {
    name: "Collection",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["LUXU-1631", "SGK-117", "EVA-178", "GANA-3003", "SIRO-5232", "ORECO-907", "MAAN-1022", "NTK-825", "DANDY-923", "EBOD-911", "sone-306", "DOCD-008", "300MAAN-546", "300MIUM-527", "LUXU-1814", "LUXU-1478", "LUXU-1041", "259LUXU-1511", "LUXU-1621", "LUXU-950", "LUXU-1561", "259LUXU-1518", "259LUXU-1571", "259LUXU-1610", "259LUXU-1618", "259LUXU-1621", "259LUXU-1631", "259LUXU-688", "259LUXU-743", "ADN-630", "ARA-412", "CLUB-855", "DDHP-044", "FC2-PPV-2864495", "GANA-2858", "JUFE-028", "JUL-872", "KTB-018", "MIUM-681", "MIUM-742", "MIUM-811", "NTK-391", "ORECS-132", "SSNI-362", "SUKE-043", "SUKE-053", "TOUKA-01"]
  },
  {
    name: "Ema Yuina",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ABP-433", "ABP-447", "ABP-460", "ABP-471", "ABP-484", "BGN-031", "CHN-096"]
  },
  {
    name: "Hana Haruna ",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUFD-867", "PKPT-015", "TOEN-020", "UFE-084", "VRTM-446", "GANA-2100"]
  },
  {
    name: "Hana Himesaki",
    cover: "NSFS-012",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["FPRE-199", "NACX-148", "348NTR-024", "ABP-892", "ABP-943", "ABP-971", "ABW-019", "FPRE-199", "JUFE-264", "KAM-213", "LULU-076", "MIAA-392", "MXGS-1306", "NSFS-012", "300MIUM-720"]
  },
  {
    name: "Haruka Riri",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["CKCK-020", "EBWH-138", "EBWH-191"]
  },
  {
    name: "Hikari Ogura",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["EBWH-222", "EBWH-258", "EBWH-264", "EBWH-289"]
  },
  {
    name: "Hitomi Tanaka",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ATID-192", "DASD-132", "MDYD-895", "MDYD-940", "MDYD-971", "MIDE-184", "MIDD-933", "MIMK-007", "PPPD-441", "PPPD-618", "PPPD-628", "PPPD-663", "PPPD-671", "PPPD-703", "PPPD-752", "PPPD-818", "PPPD-824", "PPPD-835", "PPPD-867", "PPPD-881", "PPPD-996"]
  },
  {
    name: "Hoshino Nami",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNIS-373", "SNIS-462"]
  },
  {
    name: "JULIA",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["MDYD-751", "PRED-293", "WANZ-808", "MIMK-268"]
  },
  {
    name: "Kana Kusakabe",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["HMN-519", "MIDE-752", "JUQ-580", "JUQ-905", "EBOD-973", "ADN-282", "JUFE-485", "JUR-216"]
  },
  {
    name: "Kanno Sayuki/Airi Hinata",
    cover: "MDYD-789",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["GVG-122", "EBOD-137", "MDYD-789", "NITR-223", "VENU-668", "VENU-662", "JKSR-250", "NDRA-029"]
  },
  {
    name: "Shio Asami/Kanon Hinano",
    cover: "IPZZ-736",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["IPZZ-801", "IPZZ-776", "DLDSS-361", "DLDSS-362", "DLDSS-372", "FWAY-086", "IPZZ-736", "DLDSS-406", "DLDSS-402", "DLDSS-381", "DLDSS-343", "DLDSS-342"]
  },
  {
    name: "Kiritani Matsuri",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["MEYD-624"]
  },
  {
    name: "Miyu Kiyohara",
    cover: "",
    url: "",
    // Custom cover
    compilations: ["OFJE-583"],
    mainWorks: ["SONE-251", "SNOS-139", "SNOS-040", "snos-063/", "SNOS-096", "SONE-743", "SONE-621", "SONE-115", "SONE-142", "SONE-342", "SONE-387", "SONE-798", "SSIS-942", "SIVR-290", "FWAY-004", "OFJE-583", "SIVR-376", "SONE-480"]
  },
  {
    name: "Koibuchi Momona",
    cover: "",
    url: "https://pics.dmm.co.jp/mono/movie/adult/1start165/1start165pl.jpg",
    // Custom cover
    compilations: [""],
    mainWorks: ["STARS-712", "START-042", "START-165", "START-231", "START-136", "START-384", "START-501", "START-288", "START-254"]
  },
  {
    name: "Ena Koume",
    cover: "JUFE-131",
    url: "",
    // Custom cover
    compilations: ["MKCK-398"],
    mainWorks: ["CLUB-893", "JUFE-131", "KAM-196", "MADV-609", "MIMK-137", "NACT-066"]
  },
  { name: "Kokona Asakura (\u671D\u5009\u3053\u3053\u306A)", mainWorks: ["CEMD-113", "MEYD-696", "BKYN-005", "HMN-051", "230ORECO-734"] },
  {
    name: "Marina Shiraishi",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUQ-941", "JUL-225", "STAR-830"]
  },
  {
    name: "Mary Tachibana",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["NKKD-322", "ROYD-175", "DASS-843", "KAM-125", "GVH-528", "DASS-787", "DASS-360", "JUR-504", "TITG-010"]
  },
  {
    name: "Meguri",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUR-531", "JUQ-943", "PPPD-329"]
  },
  {
    name: "Mei Washio",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SSIS-383", "SSIS-558", "SSIS-585"]
  },
  {
    name: "Honoka Mihara",
    cover: "NDRA-059",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["FC2PPV-1178399", "HUNTA-430", "NHDTB-249", "SALO-028", "ECB-119", "NDRA-059", "AKA-024"]
  },
  {
    name: "Miina Wakatsuki",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["AP-444", "LUXU-856", "LUXU-1047", "CLUB-669", "GVH-222", "HUNTA-314", "HUNTA-348", "KATU-080", "NGOD-113", "NITR-202", "SW-560", "SW-621", "NITR-209", "FC2-PPV-1046522"]
  },
  {
    name: "Mina Fukuhara",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["CLUB-881"]
  },
  {
    name: "Hibiki Amemiya",
    cover: "PPPE-353",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["HZGD-327", "PRTD-034", "WAAA-550", "PPPE-353", "EBWH-111"]
  },
  {
    name: "Minato Haru",
    cover: "SONE-865",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["FC2PPV-3087371", "OFJE-567", "SNOS-114", "SNOS-073", "FC2PPV-3104502", "SNOS-073", "FC2PPV-4203485", "FWAY-002", "FWAY-060", "JDKR-032", "MIRD-259", "OFES-013", "SNOS-001", "SONE-021", "SONE-063", "SONE-155", "SONE-188", "SONE-503", "SONE-508", "SONE-776", "SONE-865", "SONE-914", "SONE-978", "SSIS-889", "SSIS-890", "SSIS-945", "SSIS-978", "TZ-124"]
  },
  {
    name: "Mio Kimijima",
    cover: "JUY-543",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["200GANA-1996", "200GANA-1707", "HND-511", "HND-547", "IQQQ-024", "IPX-083", "JUY-543", "JUY-606", "MIAE-226", "NIMA-007", "NITR-388", "PPPD-686", "URPW-039"]
  },
  {
    name: "Mitsuki Momota",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["MIDA-575", "MDVR-407", "MIDA-534", "MIDA-460", "MIRD-271", "MBDD-02167", "MIDA-498", "MIRD-274", "MIDA-026", "MIDA-064", "MIDA-102", "MIDA-139", "MIDA-190", "MIDA-214", "MIDA-258", "MIDA-305", "MIDA-346", "MIDA-385", "MIDA-424", "MIDV-569", "MIDV-574", "MIDV-577", "MIDV-637", "MIDV-668", "MIDV-698", "MIDV-769", "MIDV-804", "MIDV-831", "MIDV-869", "MIDV-905", "MIDV-985", "MDVR-288", "MDVR-317", "MDVR-325", "NAAC-032", "OAE-253", "REBD-854", "FWAY-047"]
  },
  {
    name: "Miu Shiramine",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ADN-499", "ADN-738", "ATID-641", "IPX-736", "IPX-845", "PRED-533", "PRED-685"]
  },
  {
    name: "Moa Maeda",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ADN-334", "HND-991", "JUFE-300", "MIMK-091", "MSFH-010", "MSFH-014", "MSFH-018", "MSFH-024", "MSFH-030", "MSFH-034", "PPPD-926", "WAAA-065"]
  },
  {
    name: "Momoka Nishina",
    cover: "JUC-579",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SACE-024", "BDSR-059", "JJ-002", "HBAD-137", "PPPD-127", "PPPD-130", "HODV-20693", "ADZ-241", "EKDV-131", "PPPD-117", "ETC-73", "VGD-076", "JUFD-137", "PPMD-017", "YSN-226", "BOBB-083", "BOBB-076", "JUFD-183", "JUC-579", "PYU-069", "SVDVD-278", "COM-125", "BTH-075", "BTH-056", "DFDA-110", "TYOD-190", "FLAV-106", "KTDS-359", "KTDS-385", "FCDC-056", "JUFD-233", "TID-008", "AIKB-004", "GAR-267", "PPPD-172", "YO-122", "JUFD-174", "JUFD-174 "]
  },
  {
    name: "Nagarekawa Rio",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["300MIUM-892"]
  },
  {
    name: "Nagi Hikaru",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SONE-385", "SONE-290", "SSIS-817", "SONE-081", "OFJE-558", "SONE-340", "SONE-097", "SSIS-784", "SSIS-426", "SSIS-372", "SIVR-144", "SSIS-175", "SSIS-139", "SSIS-011", "SSNI-961", "SSIS-206"]
  },
  {
    name: "Nana Fukada",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["EBOD-578"]
  },
  {
    name: "Nanami Matsumoto",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUY-858", "OFES-009", "SSNI-110"]
  },
  {
    name: "Rei Kamiki",
    cover: "",
    url: "https://pics.dmm.co.jp/mono/movie/adult/1start070/1start070pl.jpg",
    // Custom cover
    compilations: [""],
    mainWorks: ["START-070", "START-398", "STARS-734", "STARS-979", "REBDB-686", "STARS-573", "STARS-778", "START-488", "START-508", "START-306"]
  },
  {
    name: "Ren Gojou",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["MIMK-263", "SONE-394", "SONE-486", "SONE-532", "SONE-748", "SONE-837", "SONE-888"]
  },
  {
    name: "Rion Hiiragi",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["259LUXU-1840", "LUXU-1842"]
  },
  {
    name: "Saegusa Chitose",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUFD-430", "NGOD-150", "WAAA-026"]
  },
  {
    name: "Ruri Saijo",
    cover: "JUFD-502",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["ATOM-150", "GANA-1026", "IENE-596", "IESP-605", "JUFD-407", "JUFD-502", "NITR-056", "PPPD-413", "TYOD-255", "VEC-094", "VEC-135", "WANZ-103"]
  },
  {
    name: "Saeko Matsushita",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SHKD-713", "MBYD-289", "IPX-461"]
  },
  {
    name: "Sakura Kirishima",
    cover: "VOSS-094",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["LUXU-994", "ARA-219", "HTR-005-2", "071616_341", "050516-153", "ARA-327", "562-SAKURA-01", "HEYZO-1212", "080218-314", "031516-117", "040816-133", "MAAN-121", "LUXU-948", "050617-001", "562-SAKURA-K03", "GANA-1857", "LUXU-873", "AP-363", "DVAJ-360", "EKDV-514", "FSET-797", "MAXVR-7", "MDBK-260", "MKMP-001", "REAL-679", "UMMA-001", "URPW-013", "VOSS-094"]
  },
  {
    name: "Sakura Nene",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["DASD-406", "HEYZO-3675", "NITR-367", "TEM-066", "VGD-192"]
  },
  {
    name: "Satomi Hibino",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["BF-475"]
  },
  {
    name: "Satomi Mioka",
    cover: "APNS-293",
    url: "",
    // Custom cover
    compilations: ["NAGST-017"],
    mainWorks: ["HMT-018", "HAWA-287", "GERK-350", "GANA-2705", "FLC-004", "JAC-175", "ION-162", "230ORECO-189", "300MIUM-865", "300MIUM-908", "483DAM-016", "APNS-293", "HAWA-325", "HUNTB-733", "MAAN-955", "RECS-283", "SAN-406", "BARE-009", "SRTD-349", "SRTD-345", "SPAY-241", "SIRO-4820", "LUXU-1572", "ZOZO-165", "APAA-387", "GVH-477", "MRPA-006", "PKPD-217", "UZU-004", "SUN-071", "MIUM-862", "NHMSG-031", "ORECO-079", "MAAN-982", "MAAN-836", "BDST-027", "AKDL-247", "AKDL-213", "AKDL-193", "DFDM-041"]
  },
  {
    name: "Sena Hikari",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["AVSA-171", "CEMD-090", "BANK-013", "CEAD-475", "BNST-023", "HOMA-108", "JUFE-279", "MIAA-395", "PFES-002", "SAN-019", "URKK-035", "WAAA-043"]
  },
  {
    name: "Sena Kasumi",
    cover: "KTKC-074",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["200GANA-2156", "IND-063", "IND-022", "483PAK-006", "STCV-240", "SUKE-062", "MIUM-495", "STCV-232", "PAK-006", "BONY-007", "KTKC-074", "NNPJ-514", "NDH-017", "MFC-169", "MIUM-801", "NTK-637", "MFC-117", "MAAN-842", "MAAN-632", "SIRO-3954"]
  },
  {
    name: "Sunao Kokonoi",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["REAL-958"]
  },
  {
    name: "Touka Rinne",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUY-603", "JUY-984", "KTB-030", "MVSD-383", "PPPD-715", "PPPD-754", "MAAN-387", "GANA-1996"]
  },
  {
    name: "Umika Minamizawa",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["SNOS-009", "SONE-590"]
  },
  {
    name: "Yoshine Yuria",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JUFE-195", "MIMK-249", "NGOD-128", "FC2PPV-4845975"]
  },
  {
    name: "Yui Hatano",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["JJDA-058", "NGOD-304", "MIAB-154", "MRSS-153", "GVH-689", "MIAB-370", "mfyd-075", "CJOD-484", "NGOD-292", "GVH-782", "MIAB-541", "CEMD-695", "NGOD-253", "LULU-362", "BDA-205", "MRSS-153"]
  },
  {
    name: "Yuri Oshikawa",
    cover: "",
    url: "",
    // Custom cover
    compilations: [""],
    mainWorks: ["BDA-059", "JUFE-351", "LULU-181", "MILLE-009", "PPPD-666", "WANZ-388", "JUR-126", "BNST-056", "ECB-109", "BSY-022", "VEC-340", "XVSR-487", "GES-038"]
  }
];
function normalizeArtists(artists) {
  return artists.map((artist) => ({
    ...artist,
    mainWorks: normalizeWorks(artist.mainWorks),
    compilations: normalizeWorks(artist.compilations)
  }));
}
function normalizeWorks(works) {
  if (!works) return [];
  return works.map((work) => {
    if (typeof work === "object" && work.code) {
      return work;
    }
    if (typeof work === "string") {
      return { code: work };
    }
    return work;
  });
}

export { DEFAULT_ARTISTS as D, normalizeArtists as n };
//# sourceMappingURL=artistHelpers-DBqsNMC5.mjs.map
