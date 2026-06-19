import QRCode from 'qrcode';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'vue-router';
import '@iconify/vue';

const _sfc_main = {
  data() {
    return {
      qrResult: "",
      headerInfo: {
        bankInfoNested: {},
        timestampNested: {},
        tag29Nested: {},
        tag30Nested: {},
        tag62Nested: {}
      },
      parsedTLV: {},
      manualQRInput: "00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6",
      copyText: "Copy",
      activeTab: "decode",
      generatedQRImage: null,
      qrDataToGenerate: "00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6",
      editMode: false,
      editMerchantID: "",
      editCurrency: "KHR",
      editAmount: "",
      editMerchantName: "",
      editMerchantCity: "",
      editBankName: "",
      editMCC: "",
      mccSearchInput: "",
      downloadFormat: "svg",
      cambodianBanks: [
        "ABA Bank",
        "Canadia Bank",
        "ACLEDA Bank",
        "Chip Mong Bank",
        "Phnom Penh Commercial Bank",
        "Wing Bank",
        "Metfone Bank",
        "Campu Bank",
        "Sabay Bank"
      ],
      copiedItemId: null,
      livePreview: true,
      mccSearchFilter: "",
      sampleDataOptions: [
        {
          name: "Static Merchant",
          data: "00020101021130510016abaakhppxxx@abaa01151211209110909710208ABA Bank5204739253031165802KH5919Ousa Chea by O.CHEA6010PHNOM PENH624068360010PAYWAY@ABA01061894950208031956116304098B"
        },
        {
          name: "Dynamic Merchant",
          data: "00020101021230510016abaakhppxxx@abaa01151211209110909710208ABA Bank52047392530384054049.995802KH5919Ousa Chea by O.CHEA6010PHNOM PENH626368590010PAYWAY@ABA01061894950208031956110619BD2F18438007825964Z9934001317651843800780113176518468007863046CBB"
        },
        {
          name: "Static Remittance",
          data: "00020101021129810016cadikhppxxx@cadi010712814460212Canadia Bank10130010007018873111300100070281515204000053031165802KH5909Sok Sabay6010Phnom Penh62200816Pay to my friend6304290E"
        },
        {
          name: "Dynamic Remittance",
          data: "00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6"
        }
      ],
      currencyCodeMap: {
        "840": "US Dollar (USD)",
        "116": "Cambodian Riel (KHR)",
        "978": "Euro (EUR)",
        "036": "Australian Dollar (AUD)",
        "826": "British Pound (GBP)",
        "392": "Japanese Yen (JPY)",
        "156": "Chinese Yuan (CNY)",
        "360": "Indonesian Rupiah (IDR)",
        "458": "Malaysian Ringgit (MYR)",
        "608": "Philippine Peso (PHP)",
        "702": "Singapore Dollar (SGD)",
        "764": "Thai Baht (THB)",
        "704": "Vietnamese Dong (VND)"
      },
      merchantCategoryMap: {
        // 0700-0999: Agricultural services
        "0742": "Veterinary Services",
        "0743": "Wine Producers",
        "0744": "Champagne Producers",
        "0763": "Agricultural Co-operatives",
        "0780": "Landscaping and Horticultural Services",
        // 1500-2999: Contracted services
        "1520": "General Contractors - Residential and Commercial",
        "1711": "Heating, Plumbing and Air-Conditioning Contractors",
        "1731": "Electrical Contractors",
        "1740": "Masonry, Stonework, Tile Setting Contractors",
        "1750": "Carpentry Contractors",
        "1761": "Roofing, Siding and Sheet Metal Work Contractors",
        "1771": "Concrete Work Contractors",
        "1799": "Special Trade Contractors - Not Elsewhere Classified",
        "2741": "Miscellaneous Publishing and Printing Services",
        "2791": "Typesetting, Platemaking and Related Services",
        "2842": "Specialty Cleaning, Polishing and Sanitation",
        // 4000-4799: Transportation
        "4011": "Railroads",
        "4111": "Local and Suburban Commuter Passenger Transportation",
        "4112": "Passenger Railways",
        "4119": "Ambulance Services",
        "4121": "Taxi-cabs and Limousines",
        "4131": "Bus Lines",
        "4214": "Motor Freight Carriers and Trucking",
        "4215": "Courier Services - Air and Ground",
        "4225": "Public Warehousing and Storage",
        "4411": "Steamships and Cruise Lines",
        "4457": "Boat Rentals and Leasing",
        "4468": "Marinas, Marine Service and Supplies",
        "4511": "Airlines and Air Carriers",
        "4582": "Airports, Flying Fields and Airport Terminals",
        "4722": "Travel Agencies and Tour Operators",
        "4784": "Tolls and Bridge Fees",
        "4789": "Transportation Services - Not Elsewhere Classified",
        // 4800-4999: Utilities
        "4812": "Telecommunication Equipment and Telephone Sales",
        "4814": "Telecommunication Services",
        "4816": "Computer Network/Information Services",
        "4821": "Telegraph Services",
        "4829": "Wire Transfers and Money Orders",
        "4899": "Cable and Other Pay Television Services",
        "4900": "Utilities - Electric, Gas, Water and Sanitary",
        // 5000-5599: Retail outlets
        "5013": "Motor Vehicle Supplies and New Parts",
        "5021": "Office and Commercial Furniture",
        "5039": "Construction Materials - Not Elsewhere Classified",
        "5044": "Office, Photographic, Photocopy Equipment",
        "5045": "Computers, Computer Peripheral Equipment",
        "5046": "Commercial Equipment - Not Elsewhere Classified",
        "5047": "Dental/Laboratory/Medical/Ophthalmic Equipment",
        "5051": "Metal Service Centres and Offices",
        "5065": "Electrical Parts and Equipment",
        "5072": "Hardware Equipment and Supplies",
        "5074": "Plumbing and Heating Equipment and Supplies",
        "5085": "Industrial Supplies - Not Elsewhere Classified",
        "5094": "Precious Stones and Metals, Watches and Jewellery",
        "5099": "Durable Goods - Not Elsewhere Classified",
        "5111": "Stationery, Office Supplies and Printing Paper",
        "5122": "Drugs, Drug Proprietors",
        "5131": "Piece Goods, Notions and Other Dry Goods",
        "5137": "Men's, Women's and Children's Uniforms",
        "5139": "Commercial Footwear",
        "5169": "Chemicals and Allied Products",
        "5172": "Petroleum and Petroleum Products",
        "5192": "Books, Periodicals and Newspapers",
        "5193": "Florists' Supplies, Nursery Stock and Flowers",
        "5198": "Paints, Varnishes and Supplies",
        "5199": "Non-durable Goods - Not Elsewhere Classified",
        "5200": "Home Supply Warehouse Outlets",
        "5211": "Lumber and Building Materials Outlets",
        "5231": "Glass, Paint and Wallpaper Shops",
        "5251": "Hardware Shops",
        "5261": "Lawn and Garden Supplies Outlets",
        "5262": "Ecommerce Site - Marketplace Operator",
        "5271": "Mobile Home Dealers",
        "5300": "Wholesale Clubs",
        "5309": "Duty-free Shops",
        "5310": "Discount Shops",
        "5311": "Department Stores",
        "5331": "Variety Stores",
        "5399": "Miscellaneous General Merchandise",
        "5411": "Groceries and Supermarkets",
        "5422": "Freezer and Locker Meat Provisioners",
        "5441": "Candy, Nut and Confectionery Shops",
        "5451": "Dairies",
        "5462": "Bakeries",
        "5499": "Miscellaneous Food Shops",
        // 5500-5599: Automobiles and vehicles
        "5511": "Car and Truck Dealers - New and Used",
        "5521": "Car and Truck Dealers - Used Only",
        "5531": "Auto and Home Supply Outlets",
        "5532": "Automotive Tyre Outlets",
        "5533": "Automotive Parts and Accessories Outlets",
        "5541": "Service Stations - With or Without Ancillary Services",
        "5542": "Automated Fuel Dispensers",
        "5551": "Boat Dealers",
        "5552": "Electrical Vehicle Charging",
        "5561": "Camper, Recreational and Utility Trailer Dealers",
        "5571": "Motorcycle Shops and Dealers",
        "5592": "Motor Home Dealers",
        "5598": "Snowmobile Dealers",
        "5599": "Miscellaneous Automotive Dealers",
        // 5600-5699: Clothing outlets
        "5611": "Men's and Boys' Clothing and Accessory Shops",
        "5621": "Women's Ready-to-wear Shops",
        "5631": "Women's Accessory and Specialty Shops",
        "5641": "Children's and Infants' Wear Shops",
        "5651": "Family Clothing Shops",
        "5655": "Sports and Riding Apparel Shops",
        "5661": "Shoe Shops",
        "5681": "Furriers and Fur Shops",
        "5691": "Men's and Women's Clothing Shops",
        "5697": "Tailors, Seamstresses, Mending and Alterations",
        "5698": "Wig and Toupee Shops",
        "5699": "Miscellaneous Apparel and Accessory Shops",
        // 5700-5999: Miscellaneous outlets
        "5712": "Furniture, Home Furnishings and Equipment Shops",
        "5713": "Floor Covering Services",
        "5714": "Drapery, Window Covering and Upholstery Shops",
        "5715": "Alcoholic Beverage Wholesalers",
        "5718": "Fireplaces, Fireplace Screens and Accessories Shops",
        "5719": "Miscellaneous Home Furnishing Specialty Shops",
        "5722": "Household Appliance Shops",
        "5723": "Gun and Ammunition Shops",
        "5732": "Electronics Shops",
        "5733": "Music Shops - Musical Instruments, Pianos and Sheet Music",
        "5734": "Computer Software Outlets",
        "5735": "Record Shops",
        "5811": "Caterers",
        "5812": "Eating Places and Restaurants",
        "5813": "Drinking Places - Bars, Taverns, Night-clubs",
        "5814": "Fast Food Restaurants",
        "5815": "Digital Goods - Media: Books, Movies, Music",
        "5816": "Digital Goods - Games",
        "5817": "Digital Goods - Application (Excludes Games)",
        "5818": "Large Digital Goods Merchant",
        "5912": "Drug Stores and Pharmacies",
        "5921": "Package Shops - Beer, Wine and Liquor",
        "5931": "Used Merchandise and Second-hand Shops",
        "5932": "Antique Shops - Sales, Repairs and Restoration",
        "5933": "Pawn Shops",
        "5935": "Wrecking and Salvage Yards",
        "5937": "Antique Reproduction Shops",
        "5940": "Bicycle Shops - Sales and Service",
        "5941": "Sporting Goods Shops",
        "5942": "Bookshops",
        "5943": "Stationery, Office and School Supply Shops",
        "5944": "Jewellery, Watch, Clock and Silverware Shops",
        "5945": "Hobby, Toy and Game Shops",
        "5946": "Camera and Photographic Supply Shops",
        "5947": "Gift, Card, Novelty and Souvenir Shops",
        "5948": "Luggage and Leather Goods Shops",
        "5949": "Sewing, Needlework, Fabric and Piece Goods Shops",
        "5950": "Glassware and Crystal Shops",
        "5960": "Direct Marketing - Insurance Services",
        "5962": "Telemarketing - Travel-related Arrangement Services",
        "5963": "Door-to-door Sales",
        "5964": "Direct Marketing - Catalogue Merchants",
        "5965": "Direct Marketing - Combination Catalogue and Retail",
        "5966": "Direct Marketing - Outbound Telemarketing Merchants",
        "5967": "Direct Marketing - Inbound Telemarketing Merchants",
        "5968": "Direct Marketing - Continuity/Subscription Merchants",
        "5969": "Direct Marketing - Not Elsewhere Classified",
        "5970": "Artist Supply and Craft Shops",
        "5971": "Art Dealers and Galleries",
        "5972": "Stamp and Coin Shops",
        "5973": "Religious Goods and Shops",
        "5975": "Hearing Aids - Sales, Service and Supplies",
        "5976": "Orthopaedic Goods and Prosthetic Devices",
        "5977": "Cosmetic Shops",
        "5978": "Typewriter Outlets - Sales, Service and Rentals",
        "5983": "Fuel Dealers - Fuel Oil, Wood, Coal",
        "5992": "Florists",
        "5993": "Cigar Shops and Stands",
        "5994": "Newsagents and News-stands",
        "5995": "Pet Shops, Pet Food and Supplies",
        "5996": "Swimming Pools - Sales, Supplies and Services",
        "5997": "Electric Razor Shops - Sales and Service",
        "5998": "Tent and Awning Shops",
        "5999": "Miscellaneous and Specialty Retail Outlets",
        // 6000-7299: Service providers
        "6010": "Financial Institutions - Manual Cash Disbursements",
        "6011": "Financial Institutions - Automated Cash Disbursements",
        "6012": "Financial Institutions - Merchandise and Services",
        "6051": "Non-financial Institutions - Foreign Currency",
        "6211": "Securities - Brokers and Dealers",
        "6300": "Insurance Sales, Underwriting and Premiums",
        "7011": "Lodging - Hotels, Motels and Resorts",
        "7012": "Timeshares",
        "7032": "Sporting and Recreational Camps",
        "7033": "Trailer Parks and Camp-sites",
        "7210": "Laundry, Cleaning and Garment Services",
        "7211": "Laundry Services - Family and Commercial",
        "7216": "Dry Cleaners",
        "7217": "Carpet and Upholstery Cleaning",
        "7221": "Photographic Studios",
        "7230": "Beauty and Barber Shops",
        "7251": "Shoe Repair Shops, Shoe Shine Parlours",
        "7261": "Funeral Services and Crematoriums",
        "7273": "Dating and Escort Services",
        "7276": "Tax Preparation Services",
        "7277": "Counselling Services - Debt, Marriage and Personal",
        "7278": "Buying and Shopping Services and Clubs",
        "7296": "Clothing Rentals - Costumes, Uniforms",
        "7297": "Massage Parlours",
        "7298": "Health and Beauty Spas",
        "7299": "Miscellaneous Personal Services",
        "7311": "Advertising Services",
        "7321": "Consumer Credit Reporting Agencies",
        "7322": "Debt Collection Agencies",
        "7333": "Commercial Photography, Art and Graphics",
        "7338": "Quick Copy, Reproduction and Blueprinting Services",
        "7339": "Stenographic and Secretarial Support Services",
        "7342": "Exterminating and Disinfecting Services",
        "7349": "Cleaning, Maintenance and Janitorial Services",
        "7361": "Employment Agencies and Temporary Help Services",
        "7372": "Computer Programming, Data Processing Services",
        "7375": "Information Retrieval Services",
        "7379": "Computer Maintenance and Repair Services",
        "7392": "Money Transfer / Remittance - Management, Consulting",
        "7393": "Detective Agencies, Protective Agencies and Security",
        "7394": "Equipment, Tool, Furniture and Appliance Rentals",
        "7395": "Photofinishing Laboratories and Photo Developing",
        "7399": "Business Services - Not Elsewhere Classified",
        "7512": "Automobile Rentals",
        "7513": "Truck and Utility Trailer Rentals",
        "7519": "Motor Home and Recreational Vehicle Rentals",
        "7523": "Parking Lots and Garages",
        "7531": "Automotive Body Repair Shops",
        "7534": "Tyre Retreading and Repair Shops",
        "7535": "Automotive Paint Shops",
        "7538": "Automotive Service Shops - Non-dealer",
        "7542": "Car Washes",
        "7549": "Towing Services",
        "7622": "Electronics Repair Shops",
        "7623": "Air Conditioning and Refrigeration Repair",
        "7629": "Electrical and Small Appliance Repair Shops",
        "7631": "Watch, Clock and Jewellery Repair Shops",
        "7641": "Furniture Reupholstery, Repair and Refinishing",
        "7692": "Welding Services",
        "7699": "Miscellaneous Repair Shops and Related Services",
        // 7800-7999: Amusement and entertainment
        "7800": "Government Owned Lotteries",
        "7801": "Government Licensed Online Casinos",
        "7802": "Government-licensed Horse/Dog Racing",
        "7829": "Motion Picture and Video Tape Production",
        "7832": "Motion Picture Theatres",
        "7841": "Video Tape Rentals",
        "7911": "Dance Halls, Studios and Schools",
        "7922": "Theatrical Producers and Ticket Agencies",
        "7929": "Bands, Orchestras and Miscellaneous Entertainers",
        "7932": "Billiard and Pool Establishments",
        "7933": "Bowling Alleys",
        "7941": "Commercial Sports, Professional Sports Clubs",
        "7991": "Tourist Attractions and Exhibits",
        "7992": "Public Golf Courses",
        "7993": "Video Amusement Game Supplies",
        "7994": "Video Game Arcades and Establishments",
        "7995": "Betting, Including Lottery Tickets, Casino Gaming",
        "7996": "Amusement Parks, Circuses, Carnivals",
        "7997": "Membership Clubs - Sports, Recreation, Athletic",
        "7998": "Aquariums, Seaquariums and Dolphinariums",
        "7999": "Recreation Services - Not Elsewhere Classified",
        // 8000-8999: Professional services and membership organizations
        "8011": "Doctors and Physicians - Not Elsewhere Classified",
        "8021": "Dentists and Orthodontists",
        "8031": "Osteopaths",
        "8041": "Chiropractors",
        "8042": "Optometrists and Ophthalmologists",
        "8043": "Opticians, Optical Goods and Eyeglasses",
        "8049": "Podiatrists and Chiropodists",
        "8050": "Nursing and Personal Care Facilities",
        "8062": "Hospitals",
        "8071": "Medical and Dental Laboratories",
        "8099": "Medical Services and Health Practitioners",
        "8111": "Legal Services and Attorneys",
        "8211": "Elementary and Secondary Schools",
        "8220": "Colleges, Universities, Professional Schools",
        "8241": "Correspondence Schools",
        "8244": "Business and Secretarial Schools",
        "8249": "Trade and Vocational Schools",
        "8299": "Schools and Educational Services",
        "8351": "Child Care Services",
        "8398": "Charitable and Social Service Organizations",
        "8641": "Civic, Social and Fraternal Associations",
        "8651": "Political Organizations",
        "8661": "Religious Organizations",
        "8675": "Automobile Associations",
        "8699": "Membership Organizations - Not Elsewhere Classified",
        "8734": "Testing Laboratories - Non-medical",
        "8911": "Architectural, Engineering and Surveying Services",
        "8931": "Accounting, Auditing and Bookkeeping Services",
        "8999": "Professional Services - Not Elsewhere Classified",
        // 9200-9402: Government services
        "9211": "Court Costs, Including Alimony and Child Support",
        "9222": "Fines",
        "9223": "Bail and Bond Payments",
        "9311": "Tax Payments",
        "9402": "Postal Services - Government Only",
        "9399": "Government Services - Not Elsewhere Classified"
      },
      countryCodeMap: {
        "KH": "Cambodia",
        "US": "United States",
        "GB": "United Kingdom",
        "CN": "China",
        "ID": "Indonesia",
        "MY": "Malaysia",
        "PH": "Philippines",
        "SG": "Singapore",
        "TH": "Thailand",
        "VN": "Vietnam",
        "JP": "Japan",
        "KR": "South Korea",
        "AU": "Australia"
      }
    };
  },
  computed: {
    filteredMCCMap() {
      if (!this.mccSearchFilter.trim()) {
        return this.merchantCategoryMap;
      }
      const filter = this.mccSearchFilter.toLowerCase();
      const filtered = {};
      Object.entries(this.merchantCategoryMap).forEach(([code, desc]) => {
        if (code.includes(filter) || desc.toLowerCase().includes(filter)) {
          filtered[code] = desc;
        }
      });
      return filtered;
    },
    filteredMCCForEdit() {
      if (!this.mccSearchInput.trim()) {
        return this.merchantCategoryMap;
      }
      const filter = this.mccSearchInput.toLowerCase();
      const filtered = {};
      Object.entries(this.merchantCategoryMap).forEach(([code, desc]) => {
        if (code.includes(filter) || desc.toLowerCase().includes(filter)) {
          filtered[code] = desc;
        }
      });
      return filtered;
    }
  },
  mounted() {
    if (this.manualQRInput.trim()) {
      this.$nextTick(() => {
        this.decodeManualQR();
      });
    }
    if (this.qrDataToGenerate.trim()) {
      this.$nextTick(() => {
        this.generateQRCode();
      });
    }
    (void 0).addEventListener("paste", this.handleGlobalPaste);
  },
  beforeDestroy() {
    (void 0).removeEventListener("paste", this.handleGlobalPaste);
  },
  watch: {
    manualQRInput(newValue) {
      if (newValue.trim()) {
        this.decodeManualQR();
      }
    },
    qrDataToGenerate(newValue) {
      if (newValue.trim() && this.livePreview) {
        this.generateQRPreview();
      }
    }
  },
  methods: {
    decodeManualQR() {
      if (this.manualQRInput.trim()) {
        this.processQRResult(this.manualQRInput.trim());
      }
    },
    handlePaste(event) {
      this.$nextTick(() => {
        if (this.manualQRInput.trim()) {
          const pastedData = this.manualQRInput.trim();
          this.processQRResult(pastedData);
          this.showNotification("\u2705 QR data pasted and decoded!", "success");
        }
      });
    },
    async pasteFromClipboard() {
      try {
        if ((void 0).clipboard && (void 0).clipboard.readText) {
          const text = await (void 0).clipboard.readText();
          if (text && text.trim()) {
            this.manualQRInput = text.trim();
            this.$nextTick(() => {
              this.processQRResult(text.trim());
              this.showNotification("\u2705 QR data pasted from clipboard!", "success");
            });
          } else {
            this.showNotification("\u274C Clipboard is empty", "error");
          }
        } else {
          this.showNotification("\u274C Clipboard access not available", "error");
        }
      } catch (error) {
        console.error("Clipboard error:", error);
        this.showNotification("\u274C Failed to read clipboard", "error");
      }
    },
    handleGlobalPaste(event) {
      try {
        const clipboardData = event.clipboardData || (void 0).clipboardData;
        const pastedText = clipboardData.getData("text");
        if (pastedText && pastedText.trim()) {
          if (pastedText.includes("00") && (pastedText.includes("29") || pastedText.includes("30") || pastedText.includes("51"))) {
            this.manualQRInput = pastedText.trim();
            this.$nextTick(() => {
              this.processQRResult(pastedText.trim());
              this.showNotification("\u2705 QR data pasted and decoded!", "success");
            });
          }
        }
      } catch (error) {
        console.log("Paste error:", error);
      }
    },
    loadSampleData(event) {
      const data = event.target.value;
      if (data) {
        this.manualQRInput = data;
        this.$nextTick(() => {
          event.target.value = "";
        });
      }
    },
    processQRResult(qrString) {
      this.qrResult = qrString;
      this.parsedTLV = this.parseTLVStructure(qrString);
      this.headerInfo.tag29Nested = {};
      this.headerInfo.tag30Nested = {};
      this.headerInfo.bankInfoNested = {};
      this.headerInfo.tag62Nested = {};
      this.headerInfo.timestampNested = {};
      const baseInfo = this.extractHeaderInfo(this.parsedTLV);
      this.headerInfo = { ...this.headerInfo, ...baseInfo };
      if (this.parsedTLV["29"]) {
        this.headerInfo.tag29 = this.parsedTLV["29"];
        this.headerInfo.tag29Nested = this.parseTLVStructure(this.parsedTLV["29"].value);
      }
      if (this.parsedTLV["30"]) {
        this.headerInfo.tag30 = this.parsedTLV["30"];
        this.headerInfo.tag30Nested = this.parseTLVStructure(this.parsedTLV["30"].value);
      }
      if (this.parsedTLV["51"]) {
        this.headerInfo.bankInfoTag = this.parsedTLV["51"];
        this.headerInfo.bankInfoNested = this.parseTLVStructure(this.parsedTLV["51"].value);
      }
      if (this.parsedTLV["52"]) this.headerInfo.merchantCategoryTag = this.parsedTLV["52"];
      if (this.parsedTLV["53"]) this.headerInfo.currencyTag = this.parsedTLV["53"];
      if (this.parsedTLV["54"]) this.headerInfo.amountTag = this.parsedTLV["54"];
      if (this.parsedTLV["58"]) this.headerInfo.countryTag = this.parsedTLV["58"];
      if (this.parsedTLV["59"]) this.headerInfo.merchantNameTag = this.parsedTLV["59"];
      if (this.parsedTLV["60"]) this.headerInfo.merchantCityTag = this.parsedTLV["60"];
      if (this.parsedTLV["62"]) {
        this.headerInfo.additionalDataTag = this.parsedTLV["62"];
        this.headerInfo.tag62Nested = this.parseTLVStructure(this.parsedTLV["62"].value);
      }
      if (this.parsedTLV["63"]) this.headerInfo.encryptionTag = this.parsedTLV["63"];
      if (this.parsedTLV["99"]) {
        this.headerInfo.timestampTag = this.parsedTLV["99"];
        this.headerInfo.timestampNested = this.parseTLVStructure(this.parsedTLV["99"].value);
      }
    },
    parseTLVStructure(dataString) {
      const result = {};
      let position = 0;
      while (position < dataString.length - 1) {
        if (position + 2 > dataString.length) break;
        const tag = dataString.substring(position, position + 2);
        position += 2;
        if (position + 2 > dataString.length) break;
        const lengthStr = dataString.substring(position, position + 2);
        const length = parseInt(lengthStr, 10);
        position += 2;
        if (isNaN(length) || length < 0) break;
        if (position + length > dataString.length) {
          let found = false;
          for (let i = position; i < Math.min(position + length + 10, dataString.length - 4); i++) {
            const nextTag = dataString.substring(i, i + 2);
            const nextLenStr = dataString.substring(i + 2, i + 4);
            const nextLen = parseInt(nextLenStr, 10);
            if (/^\d{2}$/.test(nextTag) && !isNaN(nextLen) && nextLen > 0 && nextLen < 255 && i + 4 + nextLen <= dataString.length) {
              const truncatedLength = i - position;
              if (truncatedLength > 0) {
                const value2 = dataString.substring(position, position + truncatedLength);
                result[tag] = { tag, length, value: value2 };
              }
              position = i;
              found = true;
              break;
            }
          }
          if (!found) break;
          continue;
        }
        const value = dataString.substring(position, position + length);
        position += length;
        result[tag] = {
          tag,
          length,
          value
        };
      }
      return result;
    },
    extractHeaderInfo(tlvData) {
      const info = {};
      if (tlvData["00"]) {
        info.payloadIndicator = tlvData["00"];
      }
      if (tlvData["01"]) {
        info.initiationMethod = tlvData["01"];
      }
      if (tlvData["30"]) {
        info.merchantType = tlvData["30"];
      }
      return info;
    },
    clearData() {
      this.qrResult = "";
      this.headerInfo = {};
      this.parsedTLV = {};
      this.manualQRInput = "";
      this.copyText = "Copy";
    },
    copyToClipboard() {
      (void 0).clipboard.writeText(this.qrResult).then(() => {
        this.copyText = "Copied!";
        setTimeout(() => {
          this.copyText = "Copy";
        }, 2e3);
      });
    },
    getMerchantCategoryDescription(code) {
      return this.merchantCategoryMap[code] || `Category: ${code}`;
    },
    getInitiationMethodDescription(code) {
      const methodMap = {
        "11": "Static QR Code",
        "12": "Dynamic QR Code"
      };
      return methodMap[code] || `Initiation Method: ${code}`;
    },
    toggleEditMode() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      this.editMode = !this.editMode;
      if (this.editMode) {
        this.editMerchantID = ((_b = (_a = this.headerInfo.tag29Nested) == null ? void 0 : _a["01"]) == null ? void 0 : _b.value) || ((_d = (_c = this.headerInfo.tag30Nested) == null ? void 0 : _c["01"]) == null ? void 0 : _d.value) || ((_f = (_e = this.headerInfo.bankInfoNested) == null ? void 0 : _e["01"]) == null ? void 0 : _f.value) || "";
        this.editCurrency = ((_g = this.headerInfo.currencyTag) == null ? void 0 : _g.value) === "840" ? "USD" : "KHR";
        this.editAmount = ((_h = this.headerInfo.amountTag) == null ? void 0 : _h.value) || "";
        this.editMerchantName = ((_i = this.headerInfo.merchantNameTag) == null ? void 0 : _i.value) || "";
        this.editMerchantCity = ((_j = this.headerInfo.merchantCityTag) == null ? void 0 : _j.value) || "";
        this.editBankName = ((_l = (_k = this.headerInfo.tag29Nested) == null ? void 0 : _k["02"]) == null ? void 0 : _l.value) || ((_n = (_m = this.headerInfo.tag30Nested) == null ? void 0 : _m["02"]) == null ? void 0 : _n.value) || ((_p = (_o = this.headerInfo.bankInfoNested) == null ? void 0 : _o["02"]) == null ? void 0 : _p.value) || "";
        this.editMCC = ((_q = this.headerInfo.merchantCategoryTag) == null ? void 0 : _q.value) || "";
        this.mccSearchInput = "";
      } else {
        this.resetEditForm();
      }
    },
    updateMerchantData() {
      var _a, _b, _c, _d, _e, _f;
      if (!this.qrResult || !this.canUpdate()) {
        this.showNotification("\u274C Please fill in required fields", "error");
        return;
      }
      try {
        let updatedResult = this.qrResult;
        if (this.editMerchantID) {
          updatedResult = this.updateTag(
            updatedResult,
            ((_a = this.headerInfo.tag29Nested) == null ? void 0 : _a["01"]) || ((_b = this.headerInfo.tag30Nested) == null ? void 0 : _b["01"]) || ((_c = this.headerInfo.bankInfoNested) == null ? void 0 : _c["01"]),
            "01",
            this.editMerchantID
          );
        }
        if (this.headerInfo.currencyTag) {
          const newCurrency = this.editCurrency === "USD" ? "840" : "116";
          const oldTag53 = "53" + String(this.headerInfo.currencyTag.length).padStart(2, "0") + this.headerInfo.currencyTag.value;
          const newTag53 = "5303" + newCurrency;
          updatedResult = updatedResult.replace(oldTag53, newTag53);
        }
        if (this.editAmount && this.headerInfo.amountTag) {
          updatedResult = this.updateTag(
            updatedResult,
            this.headerInfo.amountTag,
            "54",
            this.editAmount,
            true
          );
        }
        if (this.editMerchantName && this.headerInfo.merchantNameTag) {
          updatedResult = this.updateTag(
            updatedResult,
            this.headerInfo.merchantNameTag,
            "59",
            this.editMerchantName,
            true
          );
        }
        if (this.editMerchantCity && this.headerInfo.merchantCityTag) {
          updatedResult = this.updateTag(
            updatedResult,
            this.headerInfo.merchantCityTag,
            "60",
            this.editMerchantCity,
            true
          );
        }
        if (this.editBankName) {
          updatedResult = this.updateTag(
            updatedResult,
            ((_d = this.headerInfo.tag29Nested) == null ? void 0 : _d["02"]) || ((_e = this.headerInfo.tag30Nested) == null ? void 0 : _e["02"]) || ((_f = this.headerInfo.bankInfoNested) == null ? void 0 : _f["02"]),
            "02",
            this.editBankName
          );
        }
        if (this.editMCC && this.headerInfo.merchantCategoryTag) {
          updatedResult = this.updateTag(
            updatedResult,
            this.headerInfo.merchantCategoryTag,
            "52",
            this.editMCC
          );
        }
        updatedResult = updatedResult.replace(/63\d{2}[A-F0-9a-f]{4}$/, "");
        const newChecksum = this.calculateCRC16(updatedResult);
        updatedResult = updatedResult + "6304" + newChecksum;
        this.manualQRInput = updatedResult;
        this.processQRResult(updatedResult);
        this.editMode = false;
        this.mccSearchInput = "";
        this.showNotification("\u2705 Data updated! Checksum encrypted with CRC-16/IBM-3740", "success");
      } catch (error) {
        console.error("Update error:", error);
        this.showNotification("\u274C Error updating QR data", "error");
      }
    },
    updateTag(qrString, tagData, tagNumber, newValue, useFullTag = false) {
      if (!tagData) return qrString;
      if (useFullTag) {
        const oldTag = tagNumber + String(tagData.length).padStart(2, "0") + tagData.value;
        const newTag = tagNumber + String(newValue.length).padStart(2, "0") + newValue;
        return qrString.replace(oldTag, newTag);
      } else {
        const oldTag = tagNumber + String(tagData.length).padStart(2, "0") + tagData.value;
        const newTag = tagNumber + String(newValue.length).padStart(2, "0") + newValue;
        return qrString.replace(oldTag, newTag);
      }
    },
    isValidAmount() {
      if (!this.editAmount) return false;
      return /^\d+(\.\d{1,2})?$/.test(this.editAmount);
    },
    validateAmount() {
      this.editAmount = this.editAmount.replace(/[^0-9.]/g, "");
      const parts = this.editAmount.split(".");
      if (parts.length > 2) {
        this.editAmount = parts[0] + "." + parts[1];
      }
    },
    canUpdate() {
      return this.editMerchantID && this.editMerchantName && this.editAmount && this.isValidAmount() && this.editMCC;
    },
    resetEditForm() {
      this.editMerchantID = "";
      this.editCurrency = "KHR";
      this.editAmount = "";
      this.editMerchantName = "";
      this.editMerchantCity = "";
      this.editBankName = "";
      this.editMCC = "";
      this.mccSearchInput = "";
    },
    showNotification(message, type = "info") {
      const notification = (void 0).createElement("div");
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      (void 0).body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 3e3);
    },
    getCurrencyDescription(code) {
      const codeStr = String(code).padStart(3, "0");
      return this.currencyCodeMap[codeStr] || `Currency Code: ${code}`;
    },
    getCountryDescription(code) {
      return this.countryCodeMap[code] || `Country: ${code}`;
    },
    getTimestampReadableWithoutExpired(timestamp) {
      if (!timestamp) return "";
      let ms = parseInt(timestamp, 10);
      if (isNaN(ms)) return "";
      try {
        const date = new Date(ms);
        const options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok"
        };
        return date.toLocaleString("en-US", options) + " ICT";
      } catch {
        return "";
      }
    },
    isTimestampExpired(timestamp) {
      if (!timestamp) return false;
      let ms = parseInt(timestamp, 10);
      if (isNaN(ms)) return false;
      try {
        const date = new Date(ms);
        const now = /* @__PURE__ */ new Date();
        return date < now;
      } catch {
        return false;
      }
    },
    formatLength(length) {
      return String(length).padStart(2, "0");
    },
    calculateCRC16(data) {
      let crc = 0;
      for (let i = 0; i < data.length; i++) {
        const byte = data.charCodeAt(i);
        crc ^= byte << 8;
        for (let j = 0; j < 8; j++) {
          crc <<= 1;
          if (crc & 65536) {
            crc ^= 4129;
          }
          crc &= 65535;
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, "0");
    },
    validateChecksum(qrData) {
      const checksumMatch = qrData.match(/63\d{2}([A-Fa-f0-9]{4})$/);
      if (!checksumMatch) return null;
      const providedChecksum = checksumMatch[1].toUpperCase();
      const dataWithoutChecksum = qrData.replace(/63\d{2}[A-Fa-f0-9]{4}$/, "");
      const calculatedChecksum = this.calculateCRC16(dataWithoutChecksum);
      return providedChecksum === calculatedChecksum;
    },
    getCRCCalculatorLink() {
      let qrWithoutChecksum = this.qrResult;
      qrWithoutChecksum = qrWithoutChecksum.replace(/63\d{2}[A-Fa-f0-9]{4}$/, "");
      const encodedData = encodeURIComponent(qrWithoutChecksum);
      return `https://crccalc.com/?crc=${encodedData}&method=CRC-16/IBM-3740&datatype=ascii&outtype=hex`;
    },
    generateQRPreview() {
      if (this.livePreview && this.qrDataToGenerate.trim()) {
        this.generateQRCode();
      }
    },
    async generateQRCode() {
      if (!this.qrDataToGenerate.trim()) {
        alert("Please enter KHQR data to generate a QR code");
        return;
      }
      try {
        this.generatedQRImage = await QRCode.toDataURL(this.qrDataToGenerate.trim(), {
          errorCorrectionLevel: "H",
          type: "image/png",
          quality: 0.95,
          margin: 1,
          width: 300,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
        alert("Failed to generate QR code. Please check the data format.");
      }
    },
    downloadQRCode() {
      if (!this.generatedQRImage) return;
      const link = (void 0).createElement("a");
      if (this.downloadFormat === "svg") {
        QRCode.toString(this.qrDataToGenerate.trim(), {
          errorCorrectionLevel: "H",
          type: "image/svg+xml",
          quality: 0.95,
          margin: 1,
          width: 300,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        }, (err, url) => {
          if (err) {
            console.error("Error generating SVG:", err);
            return;
          }
          link.href = url;
          link.download = `khqr-${Date.now()}.svg`;
          (void 0).body.appendChild(link);
          link.click();
          (void 0).body.removeChild(link);
        });
      } else if (this.downloadFormat === "jpg") {
        link.href = this.generatedQRImage;
        link.download = `khqr-${Date.now()}.jpg`;
        (void 0).body.appendChild(link);
        link.click();
        (void 0).body.removeChild(link);
      } else {
        link.href = this.generatedQRImage;
        link.download = `khqr-${Date.now()}.png`;
        (void 0).body.appendChild(link);
        link.click();
        (void 0).body.removeChild(link);
      }
    },
    clearGenerate() {
      this.qrDataToGenerate = "";
      this.generatedQRImage = null;
    },
    calculateTimeDifference(timeDiff) {
      const totalSeconds = Math.floor(timeDiff / 1e3);
      const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
      const remainingAfterWeeks = totalSeconds % (7 * 24 * 60 * 60);
      const days = Math.floor(remainingAfterWeeks / (24 * 60 * 60));
      const remainingAfterDays = remainingAfterWeeks % (24 * 60 * 60);
      const hours = Math.floor(remainingAfterDays / (60 * 60));
      const remainingAfterHours = remainingAfterDays % (60 * 60);
      const minutes = Math.floor(remainingAfterHours / 60);
      const seconds = remainingAfterHours % 60;
      return { weeks, days, hours, minutes, seconds };
    },
    formatTimeDifference(weeks, days, hours, minutes, seconds) {
      const parts = [];
      if (weeks > 0) parts.push(`${weeks}w`);
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
      return parts.join(" ");
    },
    getTimestampStatus() {
      var _a;
      if (!((_a = this.headerInfo.timestampNested) == null ? void 0 : _a["01"])) {
        return "\u2717 Not Present";
      }
      const expiryTime = parseInt(this.headerInfo.timestampNested["01"].value, 10);
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (isNaN(expiryTime)) {
        return "\u26A0\uFE0F Invalid";
      }
      if (expiryTime > now) {
        const timeDiff = expiryTime - now;
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(timeDiff);
        const formattedTime = this.formatTimeDifference(weeks, days, hours, minutes, seconds);
        return `\u2713 Valid (${formattedTime} left)`;
      } else {
        const timeDiff = now - expiryTime;
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(timeDiff);
        const formattedTime = this.formatTimeDifference(weeks, days, hours, minutes, seconds);
        return `\u2717 Expired (${formattedTime} ago)`;
      }
    },
    getTimestampStatusClass() {
      var _a;
      if (!((_a = this.headerInfo.timestampNested) == null ? void 0 : _a["01"])) {
        return "ts-missing";
      }
      const expiryTime = parseInt(this.headerInfo.timestampNested["01"].value, 10);
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (isNaN(expiryTime)) {
        return "ts-invalid";
      }
      return expiryTime > now ? "ts-valid" : "ts-expired";
    },
    getTimestampBadgeClass() {
      var _a;
      if (!((_a = this.headerInfo.timestampNested) == null ? void 0 : _a["01"])) {
        return "ts-badge ts-badge-none";
      }
      const expiryTime = parseInt(this.headerInfo.timestampNested["01"].value, 10);
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (isNaN(expiryTime)) {
        return "ts-badge ts-badge-invalid";
      }
      return expiryTime > now ? "ts-badge ts-badge-valid" : "ts-badge ts-badge-expired";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a, _b, _c, _d;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-7d43a5bd><div class="scanner-card" data-v-7d43a5bd><div class="header" data-v-7d43a5bd><div class="header-content" data-v-7d43a5bd><h1 class="title" data-v-7d43a5bd>\u{1F1F0}\u{1F1ED} KHQR Scanner</h1><p class="subtitle" data-v-7d43a5bd>Decode and generate Cambodian payment QR codes</p></div></div><div class="tab-navigation" data-v-7d43a5bd><button class="${ssrRenderClass(["tab-button", { active: $data.activeTab === "decode" }])}" data-v-7d43a5bd><span class="tab-icon" data-v-7d43a5bd>\u{1F50D}</span><span class="tab-text" data-v-7d43a5bd>Decode</span></button><button class="${ssrRenderClass(["tab-button", { active: $data.activeTab === "generate" }])}" data-v-7d43a5bd><span class="tab-icon" data-v-7d43a5bd>\u2728</span><span class="tab-text" data-v-7d43a5bd>Generate</span></button><button class="${ssrRenderClass(["tab-button", { active: $data.activeTab === "reference" }])}" data-v-7d43a5bd><span class="tab-icon" data-v-7d43a5bd>\u{1F4DA}</span><span class="tab-text" data-v-7d43a5bd>Reference</span></button></div><div class="tab-content" style="${ssrRenderStyle($data.activeTab === "decode" ? null : { display: "none" })}" data-v-7d43a5bd><div class="input-area" data-v-7d43a5bd><div class="sample-selector" data-v-7d43a5bd><label class="sample-label" data-v-7d43a5bd>\u{1F4CB} Sample Data:</label><select class="sample-select" data-v-7d43a5bd><option value="" data-v-7d43a5bd>-- Select Sample --</option><!--[-->`);
  ssrRenderList($data.sampleDataOptions, (sample) => {
    _push(`<option${ssrRenderAttr("value", sample.data)} data-v-7d43a5bd>${ssrInterpolate(sample.name)}</option>`);
  });
  _push(`<!--]--></select></div><textarea placeholder="Paste QR code data..." class="input-field" data-v-7d43a5bd>${ssrInterpolate($data.manualQRInput)}</textarea><div class="action-buttons" data-v-7d43a5bd><button class="btn btn-primary paste-btn" data-v-7d43a5bd> \u{1F4CB} Paste from Clipboard </button><button class="btn btn-secondary" data-v-7d43a5bd> Clear </button></div></div></div>`);
  if ($data.qrResult && $data.activeTab === "decode") {
    _push(`<div class="result-section" data-v-7d43a5bd>`);
    if (!$data.headerInfo.merchantCategoryTag) {
      _push(`<div class="mcc-warning-alert" data-v-7d43a5bd><span class="mcc-warning-icon" data-v-7d43a5bd>\u26A0\uFE0F</span><div class="mcc-warning-content" data-v-7d43a5bd><span class="mcc-warning-title" data-v-7d43a5bd>Merchant Category Code (MCC) Not Found</span><span class="mcc-warning-desc" data-v-7d43a5bd>Tag 52 is missing. Consider adding MCC in edit mode for complete merchant classification.</span></div><button class="mcc-warning-btn" data-v-7d43a5bd>Add MCC</button></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="summary-card" data-v-7d43a5bd><div class="summary-item" data-v-7d43a5bd><span class="summary-label" data-v-7d43a5bd>Merchant:</span><span class="summary-value" data-v-7d43a5bd>${ssrInterpolate(((_a = $data.headerInfo.merchantNameTag) == null ? void 0 : _a.value) || "N/A")}</span></div><div class="summary-item" data-v-7d43a5bd><span class="summary-label" data-v-7d43a5bd>Amount:</span><span class="summary-value" data-v-7d43a5bd>${ssrInterpolate(((_b = $data.headerInfo.amountTag) == null ? void 0 : _b.value) ? $data.headerInfo.amountTag.value + " " + (((_c = $data.headerInfo.currencyTag) == null ? void 0 : _c.value) === "840" ? "USD" : "KHR") : "N/A")}</span></div><div class="${ssrRenderClass([{ "mcc-present": $data.headerInfo.merchantCategoryTag, "mcc-missing": !$data.headerInfo.merchantCategoryTag }, "summary-item"])}" data-v-7d43a5bd><span class="summary-label" data-v-7d43a5bd>Category (MCC):</span><span class="summary-value" data-v-7d43a5bd>`);
    if ($data.headerInfo.merchantCategoryTag) {
      _push(`<span class="mcc-badge mcc-badge-present" data-v-7d43a5bd> \u2713 ${ssrInterpolate($data.headerInfo.merchantCategoryTag.value)}</span>`);
    } else {
      _push(`<span class="mcc-badge mcc-badge-missing" data-v-7d43a5bd> \u2717 Not Present </span>`);
    }
    _push(`</span></div><div class="${ssrRenderClass([$options.getTimestampStatusClass(), "summary-item"])}" data-v-7d43a5bd><span class="summary-label" data-v-7d43a5bd>Timestamp:</span><span class="summary-value" data-v-7d43a5bd>`);
    if ((_d = $data.headerInfo.timestampNested) == null ? void 0 : _d["01"]) {
      _push(`<span class="${ssrRenderClass($options.getTimestampBadgeClass())}" data-v-7d43a5bd>${ssrInterpolate($options.getTimestampStatus())}</span>`);
    } else {
      _push(`<span class="ts-badge ts-badge-none" data-v-7d43a5bd> \u2717 Not Present </span>`);
    }
    _push(`</span></div><div class="summary-item" data-v-7d43a5bd><span class="summary-label" data-v-7d43a5bd>Data:</span><span class="summary-value" data-v-7d43a5bd>${ssrInterpolate($data.qrResult.length)} bytes / ${ssrInterpolate(Object.keys($data.parsedTLV).length)} tags</span></div></div><div class="result-header" data-v-7d43a5bd><h2 data-v-7d43a5bd>TLV Structure</h2><div class="header-buttons" data-v-7d43a5bd><button class="${ssrRenderClass([{ "edit-active": $data.editMode }, "copy-btn"])}" data-v-7d43a5bd>${ssrInterpolate($data.editMode ? "\u274C Cancel" : "\u270F\uFE0F Edit")}</button><button class="copy-btn" data-v-7d43a5bd> \u{1F4CB} ${ssrInterpolate($data.copyText)}</button></div></div>`);
    if ($data.editMode) {
      _push(`<div class="edit-panel" data-v-7d43a5bd><div class="edit-panel-header" data-v-7d43a5bd><h3 data-v-7d43a5bd>Edit KHQR Data</h3><span class="edit-info" data-v-7d43a5bd>Modify fields and update checksum</span></div><div class="edit-form-section" data-v-7d43a5bd><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Merchant ID:</label><input${ssrRenderAttr("value", $data.editMerchantID)} type="text" class="edit-input" placeholder="e.g., MERCHANT123" maxlength="50" data-v-7d43a5bd>`);
      if ($data.editMerchantID) {
        _push(`<span class="edit-field-hint" data-v-7d43a5bd>${ssrInterpolate($data.editMerchantID.length)} chars</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Currency:</label><select class="edit-select" data-v-7d43a5bd><option value="KHR" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editCurrency) ? ssrLooseContain($data.editCurrency, "KHR") : ssrLooseEqual($data.editCurrency, "KHR")) ? " selected" : ""}>KHR (Cambodian Riel)</option><option value="USD" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editCurrency) ? ssrLooseContain($data.editCurrency, "USD") : ssrLooseEqual($data.editCurrency, "USD")) ? " selected" : ""}>USD (US Dollar)</option></select></div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Amount:</label><input${ssrRenderAttr("value", $data.editAmount)} type="text" class="edit-input" placeholder="e.g., 100.50" data-v-7d43a5bd>`);
      if ($data.editAmount && !$options.isValidAmount()) {
        _push(`<span class="edit-field-error" data-v-7d43a5bd>\u26A0\uFE0F Invalid amount format</span>`);
      } else if ($data.editAmount) {
        _push(`<span class="edit-field-hint" data-v-7d43a5bd>Valid amount</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Merchant Name:</label><input${ssrRenderAttr("value", $data.editMerchantName)} type="text" class="edit-input" placeholder="e.g., My Business" maxlength="50" data-v-7d43a5bd>`);
      if ($data.editMerchantName) {
        _push(`<span class="edit-field-hint" data-v-7d43a5bd>${ssrInterpolate($data.editMerchantName.length)} chars</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Merchant City:</label><input${ssrRenderAttr("value", $data.editMerchantCity)} type="text" class="edit-input" placeholder="e.g., Phnom Penh" maxlength="50" data-v-7d43a5bd>`);
      if ($data.editMerchantCity) {
        _push(`<span class="edit-field-hint" data-v-7d43a5bd>${ssrInterpolate($data.editMerchantCity.length)} chars</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Bank Name:</label><select class="edit-select" data-v-7d43a5bd><option value="" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editBankName) ? ssrLooseContain($data.editBankName, "") : ssrLooseEqual($data.editBankName, "")) ? " selected" : ""}>-- Select Bank --</option><!--[-->`);
      ssrRenderList($data.cambodianBanks, (bank) => {
        _push(`<option${ssrRenderAttr("value", bank)} data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editBankName) ? ssrLooseContain($data.editBankName, bank) : ssrLooseEqual($data.editBankName, bank)) ? " selected" : ""}>${ssrInterpolate(bank)}</option>`);
      });
      _push(`<!--]--></select></div><div class="edit-field" data-v-7d43a5bd><label data-v-7d43a5bd>Merchant Category Code (MCC):</label><div class="mcc-selection" data-v-7d43a5bd><input${ssrRenderAttr("value", $data.mccSearchInput)} type="text" class="edit-input" placeholder="Search MCC code or description..." data-v-7d43a5bd><select class="edit-select" data-v-7d43a5bd><option value="" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editMCC) ? ssrLooseContain($data.editMCC, "") : ssrLooseEqual($data.editMCC, "")) ? " selected" : ""}>-- Select Category --</option><!--[-->`);
      ssrRenderList($options.filteredMCCForEdit, (desc, code) => {
        _push(`<option${ssrRenderAttr("value", code)} data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.editMCC) ? ssrLooseContain($data.editMCC, code) : ssrLooseEqual($data.editMCC, code)) ? " selected" : ""}>${ssrInterpolate(code)} - ${ssrInterpolate(desc)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if ($data.editMCC) {
        _push(`<span class="edit-field-hint" data-v-7d43a5bd> Selected: ${ssrInterpolate($data.editMCC)} - ${ssrInterpolate($data.merchantCategoryMap[$data.editMCC])}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="edit-validation-summary" data-v-7d43a5bd><div class="${ssrRenderClass([{ "valid": $data.editMerchantID, "invalid": !$data.editMerchantID }, "validation-item"])}" data-v-7d43a5bd><span class="validation-icon" data-v-7d43a5bd>${ssrInterpolate($data.editMerchantID ? "\u2713" : "\u25CB")}</span><span data-v-7d43a5bd>Merchant ID</span></div><div class="${ssrRenderClass([{ "valid": $data.editAmount && $options.isValidAmount(), "invalid": $data.editAmount && !$options.isValidAmount() }, "validation-item"])}" data-v-7d43a5bd><span class="validation-icon" data-v-7d43a5bd>${ssrInterpolate($data.editAmount && $options.isValidAmount() ? "\u2713" : "\u25CB")}</span><span data-v-7d43a5bd>Amount</span></div><div class="${ssrRenderClass([{ "valid": $data.editMerchantName, "invalid": !$data.editMerchantName }, "validation-item"])}" data-v-7d43a5bd><span class="validation-icon" data-v-7d43a5bd>${ssrInterpolate($data.editMerchantName ? "\u2713" : "\u25CB")}</span><span data-v-7d43a5bd>Merchant Name</span></div><div class="${ssrRenderClass([{ "valid": $data.editMCC, "invalid": !$data.editMCC }, "validation-item"])}" data-v-7d43a5bd><span class="validation-icon" data-v-7d43a5bd>${ssrInterpolate($data.editMCC ? "\u2713" : "\u25CB")}</span><span data-v-7d43a5bd>MCC</span></div></div><div class="edit-actions" data-v-7d43a5bd><button class="btn btn-primary edit-update-btn"${ssrIncludeBooleanAttr(!$options.canUpdate()) ? " disabled" : ""} data-v-7d43a5bd> \u{1F510} Update &amp; Encrypt Checksum (CRC-16/IBM-3740) </button><button class="btn btn-secondary edit-reset-btn" data-v-7d43a5bd> \u21BB Reset Form </button><button class="btn btn-secondary edit-cancel-btn" data-v-7d43a5bd> \u274C Cancel </button></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="tlv-tree" data-v-7d43a5bd>`);
    if ($data.parsedTLV["00"]) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["00"].tag)}</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate(String($data.parsedTLV["00"].length).padStart(2, "0"))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["00"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Version</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.parsedTLV["01"]) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["01"].tag)}</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate(String($data.parsedTLV["01"].length).padStart(2, "0"))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= ${ssrInterpolate($options.getInitiationMethodDescription($data.parsedTLV["01"].value))}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.tag29) {
      _push(`<div class="tree-item tree-parent" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>29</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29.length))}</span><span class="tree-meaning" data-v-7d43a5bd>= Remittance</span>`);
      if (Object.keys($data.headerInfo.tag29Nested).length > 0) {
        _push(`<div class="tree-sublayer" data-v-7d43a5bd>`);
        if ($data.headerInfo.tag29Nested["00"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>00</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29Nested["00"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag29Nested["00"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bakong ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag29Nested["01"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>01</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29Nested["01"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag29Nested["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag29Nested["02"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>02</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29Nested["02"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag29Nested["02"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bank Name</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag29Nested["10"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>10</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29Nested["10"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag29Nested["10"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Account Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag29Nested["11"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>11</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag29Nested["11"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag29Nested["11"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Reference Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.tag30) {
      _push(`<div class="tree-item tree-parent" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>30</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30.length))}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant Info</span>`);
      if (Object.keys($data.headerInfo.tag30Nested).length > 0) {
        _push(`<div class="tree-sublayer" data-v-7d43a5bd>`);
        if ($data.headerInfo.tag30Nested["00"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>00</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30Nested["00"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag30Nested["00"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bakong ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag30Nested["01"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>01</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30Nested["01"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag30Nested["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag30Nested["02"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>02</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30Nested["02"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag30Nested["02"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bank Name</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag30Nested["10"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>10</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30Nested["10"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag30Nested["10"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Account Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag30Nested["11"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>11</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag30Nested["11"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag30Nested["11"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Reference Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.bankInfoTag) {
      _push(`<div class="tree-item tree-parent" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>51</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoTag.length))}</span><span class="tree-meaning" data-v-7d43a5bd>= Bank Info</span>`);
      if (Object.keys($data.headerInfo.bankInfoNested).length > 0) {
        _push(`<div class="tree-sublayer" data-v-7d43a5bd>`);
        if ($data.headerInfo.bankInfoNested["00"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>00</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoNested["00"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.bankInfoNested["00"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bakong ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.bankInfoNested["01"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>01</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoNested["01"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.bankInfoNested["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant ID</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.bankInfoNested["02"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>02</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoNested["02"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.bankInfoNested["02"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bank Name</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.bankInfoNested["10"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>10</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoNested["10"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.bankInfoNested["10"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Account Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.bankInfoNested["11"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>11</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.bankInfoNested["11"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.bankInfoNested["11"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Reference Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.merchantCategoryTag) {
      _push(`<div class="${ssrRenderClass([{ "mcc-tag-present": $data.headerInfo.merchantCategoryTag }, "tree-item"])}" data-v-7d43a5bd><span class="tree-tag mcc-tag-highlight" data-v-7d43a5bd>52</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.merchantCategoryTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.merchantCategoryTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= ${ssrInterpolate($options.getMerchantCategoryDescription($data.headerInfo.merchantCategoryTag.value))}</span><span class="mcc-indicator" data-v-7d43a5bd>\u2713 MCC Present</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.currencyTag) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>53</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.currencyTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.currencyTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= ${ssrInterpolate($options.getCurrencyDescription($data.headerInfo.currencyTag.value))}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.amountTag) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>54</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.amountTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.amountTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Amount</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.countryTag) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>58</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.countryTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.countryTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= ${ssrInterpolate($options.getCountryDescription($data.headerInfo.countryTag.value))}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.merchantNameTag) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>59</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.merchantNameTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.merchantNameTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant Name</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.merchantCityTag) {
      _push(`<div class="tree-item" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>60</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.merchantCityTag.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.merchantCityTag.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Merchant City</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.parsedTLV["62"]) {
      _push(`<div class="tree-item tree-parent" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>62</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.parsedTLV["62"].length))}</span><span class="tree-meaning" data-v-7d43a5bd>= Additional Data</span>`);
      if (Object.keys($data.headerInfo.tag62Nested).length > 0) {
        _push(`<div class="tree-sublayer" data-v-7d43a5bd>`);
        if ($data.headerInfo.tag62Nested["01"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>01</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag62Nested["01"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag62Nested["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Bill Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag62Nested["02"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>02</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag62Nested["02"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag62Nested["02"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Mobile Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag62Nested["03"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>03</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag62Nested["03"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag62Nested["03"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Store Label</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.tag62Nested["07"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>07</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.tag62Nested["07"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.tag62Nested["07"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Terminal Number</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!["01", "02", "03", "07"].includes(_ctx.subtag)) {
          _push(`<!--[-->`);
          ssrRenderList($data.headerInfo.tag62Nested, (subtagData, subtag) => {
            _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>${ssrInterpolate(subtag)}</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength(subtagData.length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate(subtagData.value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Additional Info</span></div>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.headerInfo.timestampTag) {
      _push(`<div class="${ssrRenderClass([$options.getTimestampStatusClass(), "tree-item tree-parent"])}" data-v-7d43a5bd><span class="${ssrRenderClass([$options.getTimestampStatusClass(), "tree-tag"])}" data-v-7d43a5bd>99</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.timestampTag.length))}</span><span class="tree-meaning" data-v-7d43a5bd>= Timestamp</span><span class="ts-tree-indicator" data-v-7d43a5bd>${ssrInterpolate($options.getTimestampStatus())}</span>`);
      if (Object.keys($data.headerInfo.timestampNested).length > 0) {
        _push(`<div class="tree-sublayer" data-v-7d43a5bd>`);
        if ($data.headerInfo.timestampNested["00"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>00</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.timestampNested["00"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.timestampNested["00"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Create Time</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.timestampNested["00"]) {
          _push(`<div class="${ssrRenderClass([{ "timestamp-expired": $options.isTimestampExpired($data.headerInfo.timestampNested["00"].value) }, "tree-subitem-conversion"])}" data-v-7d43a5bd><span class="tree-meaning" data-v-7d43a5bd>\u2192 ${ssrInterpolate($options.getTimestampReadableWithoutExpired($data.headerInfo.timestampNested["00"].value))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.timestampNested["01"]) {
          _push(`<div class="tree-subitem-line" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>01</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.headerInfo.timestampNested["01"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.headerInfo.timestampNested["01"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Expiry Time</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.headerInfo.timestampNested["01"]) {
          _push(`<div class="${ssrRenderClass([{ "timestamp-expired": $options.isTimestampExpired($data.headerInfo.timestampNested["01"].value), "timestamp-valid": !$options.isTimestampExpired($data.headerInfo.timestampNested["01"].value) }, "tree-subitem-conversion"])}" data-v-7d43a5bd><span class="tree-meaning" data-v-7d43a5bd>\u2192 ${ssrInterpolate($options.getTimestampReadableWithoutExpired($data.headerInfo.timestampNested["01"].value))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.parsedTLV["63"]) {
      _push(`<div class="${ssrRenderClass([{ "checksum-valid": $options.validateChecksum($data.qrResult) === true }, "tree-item"])}" data-v-7d43a5bd><span class="tree-tag" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["63"].tag)}</span><span class="tree-length" data-v-7d43a5bd>${ssrInterpolate($options.formatLength($data.parsedTLV["63"].length))}</span><span class="tree-data" data-v-7d43a5bd>${ssrInterpolate($data.parsedTLV["63"].value)}</span><span class="tree-meaning" data-v-7d43a5bd>= Checksum (CRC-16/IBM-3740)</span>`);
      if ($data.editMode) {
        _push(`<a${ssrRenderAttr("href", $options.getCRCCalculatorLink())} target="_blank" class="crc-link" data-v-7d43a5bd> \u{1F517} Verify CRC </a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="tab-content" style="${ssrRenderStyle($data.activeTab === "generate" ? null : { display: "none" })}" data-v-7d43a5bd><div class="input-area" data-v-7d43a5bd><div class="live-preview-toggle" data-v-7d43a5bd><label class="toggle-label" data-v-7d43a5bd><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.livePreview) ? ssrLooseContain($data.livePreview, null) : $data.livePreview) ? " checked" : ""} class="toggle-checkbox" data-v-7d43a5bd><span class="toggle-switch" data-v-7d43a5bd></span><span class="toggle-text" data-v-7d43a5bd>Live Preview</span></label></div><textarea placeholder="Enter KHQR data to generate QR code..." class="input-field" style="${ssrRenderStyle({ "height": "150px" })}" data-v-7d43a5bd>${ssrInterpolate($data.qrDataToGenerate)}</textarea><div class="action-buttons" data-v-7d43a5bd>`);
  if (!$data.livePreview) {
    _push(`<button class="btn btn-primary" data-v-7d43a5bd> \u2728 Generate QR </button>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.generatedQRImage) {
    _push(`<button class="btn btn-primary" data-v-7d43a5bd> \u2B07\uFE0F Download </button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<button class="btn btn-secondary" data-v-7d43a5bd> Clear </button></div></div>`);
  if ($data.generatedQRImage) {
    _push(`<div class="generate-result" data-v-7d43a5bd><h3 class="data-label" data-v-7d43a5bd>Generated QR Code</h3><div class="qr-display-container" data-v-7d43a5bd><img${ssrRenderAttr("src", $data.generatedQRImage)} alt="Generated QR Code" class="qr-image" data-v-7d43a5bd></div><div class="download-options" data-v-7d43a5bd><label class="download-label" data-v-7d43a5bd>Download Format:</label><select class="download-select" data-v-7d43a5bd><option value="svg" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.downloadFormat) ? ssrLooseContain($data.downloadFormat, "svg") : ssrLooseEqual($data.downloadFormat, "svg")) ? " selected" : ""}>\u{1F310} SVG (Recommended)</option><option value="png" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.downloadFormat) ? ssrLooseContain($data.downloadFormat, "png") : ssrLooseEqual($data.downloadFormat, "png")) ? " selected" : ""}>\u{1F5BC}\uFE0F PNG</option><option value="jpg" data-v-7d43a5bd${ssrIncludeBooleanAttr(Array.isArray($data.downloadFormat) ? ssrLooseContain($data.downloadFormat, "jpg") : ssrLooseEqual($data.downloadFormat, "jpg")) ? " selected" : ""}>\u{1F4F7} JPG</option></select><button class="btn btn-primary" data-v-7d43a5bd> \u2B07\uFE0F Download </button></div><div class="qr-data-display" data-v-7d43a5bd><h4 class="data-label" style="${ssrRenderStyle({ "margin-top": "1rem" })}" data-v-7d43a5bd>Data</h4><pre class="data-content" data-v-7d43a5bd>${ssrInterpolate($data.qrDataToGenerate)}</pre></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="tab-content reference-tab" style="${ssrRenderStyle($data.activeTab === "reference" ? null : { display: "none" })}" data-v-7d43a5bd><div class="reference-container" data-v-7d43a5bd><div class="reference-section" data-v-7d43a5bd><h3 class="reference-title" data-v-7d43a5bd>\u{1F3E6} Cambodian Banks (Tag 29/30/51)</h3><div class="reference-grid" data-v-7d43a5bd><!--[-->`);
  ssrRenderList($data.cambodianBanks, (bank) => {
    _push(`<div class="reference-item" data-v-7d43a5bd><span class="bank-name" data-v-7d43a5bd>${ssrInterpolate(bank)}</span></div>`);
  });
  _push(`<!--]--></div></div><div class="reference-section" data-v-7d43a5bd><h3 class="reference-title" data-v-7d43a5bd>\u{1F3F7}\uFE0F KHQR Tag Definitions</h3><div class="tag-definitions" data-v-7d43a5bd><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>00</span><span class="tag-desc" data-v-7d43a5bd>Payload Format Indicator - KHQR version</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>29</span><span class="tag-desc" data-v-7d43a5bd>Merchant Type - Remittance (bank account info)</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>30</span><span class="tag-desc" data-v-7d43a5bd>Merchant Type - Merchant (business info)</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>51</span><span class="tag-desc" data-v-7d43a5bd>Acquirer Merchant ID - Bank and merchant ID</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>52</span><span class="tag-desc" data-v-7d43a5bd>Merchant Category Code - Business type</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>53</span><span class="tag-desc" data-v-7d43a5bd>Currency Code - 840 (USD) or 116 (KHR)</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>54</span><span class="tag-desc" data-v-7d43a5bd>Payment Amount - Transaction value</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>58</span><span class="tag-desc" data-v-7d43a5bd>Country Code - KH (Cambodia)</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>59</span><span class="tag-desc" data-v-7d43a5bd>Merchant Name - Business name</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>60</span><span class="tag-desc" data-v-7d43a5bd>Merchant City - Business location</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>62</span><span class="tag-desc" data-v-7d43a5bd>Additional Data - Extra info (UDF, Bill ID, etc)</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>63</span><span class="tag-desc" data-v-7d43a5bd>CRC-16/IBM-3740 - Checksum for validation</span></div><div class="tag-def" data-v-7d43a5bd><span class="tag-code" data-v-7d43a5bd>99</span><span class="tag-desc" data-v-7d43a5bd>Timestamp - Transaction date/time</span></div></div></div><div class="reference-section" data-v-7d43a5bd><h3 class="reference-title" data-v-7d43a5bd>\u{1F4BC} Merchant Category Codes (MCC)</h3><div class="mcc-search" data-v-7d43a5bd><input${ssrRenderAttr("value", $data.mccSearchFilter)} type="text" placeholder="Search MCC by code or description..." class="mcc-search-input" data-v-7d43a5bd></div><div class="mcc-list" data-v-7d43a5bd><!--[-->`);
  ssrRenderList($options.filteredMCCMap, (desc, code) => {
    _push(`<div class="mcc-item" data-v-7d43a5bd><span class="mcc-code" data-v-7d43a5bd>${ssrInterpolate(code)}</span><span class="mcc-desc" data-v-7d43a5bd>${ssrInterpolate(desc)}</span></div>`);
  });
  _push(`<!--]--></div></div><div class="reference-section" data-v-7d43a5bd><h3 class="reference-title" data-v-7d43a5bd>\u{1F4B1} Currency Codes</h3><div class="currency-grid" data-v-7d43a5bd><div class="currency-item" data-v-7d43a5bd><span class="curr-code" data-v-7d43a5bd>840</span><span class="curr-name" data-v-7d43a5bd>USD (US Dollar)</span></div><div class="currency-item" data-v-7d43a5bd><span class="curr-code" data-v-7d43a5bd>116</span><span class="curr-name" data-v-7d43a5bd>KHR (Cambodian Riel)</span></div></div></div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/QR.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const QR = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-7d43a5bd"]]);

export { QR as default };
//# sourceMappingURL=QR-maO_osUp.mjs.map
