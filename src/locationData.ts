/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface District {
  nameUz: string;
  nameEn: string;
  nameRu: string;
  lat: number;
  lng: number;
}

export interface Region {
  nameUz: string;
  nameEn: string;
  nameRu: string;
  lat: number;
  lng: number;
  districts: District[];
}

export interface Country {
  code: string;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  lat: number;
  lng: number;
  regions: Region[];
}

export const COUNTRIES: Country[] = [
  {
    code: "UZ",
    nameUz: "O'zbekiston",
    nameEn: "Uzbekistan",
    nameRu: "Узбекистан",
    lat: 41.3775,
    lng: 64.5853,
    regions: [
      {
        nameUz: "Toshkent shahri",
        nameEn: "Tashkent City",
        nameRu: "город Ташкент",
        lat: 41.2995,
        lng: 69.2401,
        districts: [
          { nameUz: "Yunusobod", nameEn: "Yunusabad", nameRu: "Юнусабад", lat: 41.3644, lng: 69.2863 },
          { nameUz: "Mirzo Ulug'bek", nameEn: "Mirzo Ulugbek", nameRu: "Мирзо Улугбек", lat: 41.3259, lng: 69.3242 },
          { nameUz: "Chilonzor", nameEn: "Chilanzar", nameRu: "Чиланзар", lat: 41.2721, lng: 69.2014 },
          { nameUz: "Uchtepa", nameEn: "Uchtepa", nameRu: "Учтепа", lat: 41.2858, lng: 69.1764 },
          { nameUz: "Yashnobod", nameEn: "Yashnabad", nameRu: "Яшнабад", lat: 41.3039, lng: 69.3235 },
          { nameUz: "Mirobod", nameEn: "Mirobod", nameRu: "Мирабад", lat: 41.2891, lng: 69.2789 },
          { nameUz: "Yakkasaroy", nameEn: "Yakkasaray", nameRu: "Яккасарай", lat: 41.2798, lng: 69.2483 },
          { nameUz: "Olmazor", nameEn: "Olmazar", nameRu: "Алмазар", lat: 41.3496, lng: 69.2198 },
          { nameUz: "Bektemir", nameEn: "Bektemir", nameRu: "Бектемир", lat: 41.2335, lng: 69.3492 },
          { nameUz: "Sergeli", nameEn: "Sergeli", nameRu: "Сергели", lat: 41.2223, lng: 69.2415 },
          { nameUz: "Yangihayot", nameEn: "Yangihayot", nameRu: "Янгихаёт", lat: 41.1989, lng: 69.2059 },
          { nameUz: "Shayxontohur", nameEn: "Shaykhontohur", nameRu: "Шайхантахур", lat: 41.3214, lng: 69.2319 }
        ]
      },
      {
        nameUz: "Toshkent viloyati",
        nameEn: "Tashkent Region",
        nameRu: "Ташкентская область",
        lat: 41.3111,
        lng: 69.2406,
        districts: [
          { nameUz: "Angren shahri", nameEn: "Angren City", nameRu: "город Ангрен", lat: 40.8497, lng: 70.0722 },
          { nameUz: "Chirchiq shahri", nameEn: "Chirchiq City", nameRu: "город Чирчик", lat: 41.4689, lng: 69.5822 },
          { nameUz: "Olmaliq shahri", nameEn: "Olmaliq City", nameRu: "город Алмалык", lat: 40.8453, lng: 69.6006 },
          { nameUz: "Bekobod shahri", nameEn: "Bekabad City", nameRu: "город Бекабад", lat: 40.2189, lng: 69.2558 },
          { nameUz: "Bekobod tumani", nameEn: "Bekabad District", nameRu: "Бекабадский район", lat: 40.2917, lng: 69.1167 },
          { nameUz: "Bo'stonliq tumani", nameEn: "Bostanlyk District", nameRu: "Бостанлыкский район", lat: 41.7242, lng: 70.0681 },
          { nameUz: "Bo'ka tumani", nameEn: "Buka District", nameRu: "Букинский район", lat: 40.8122, lng: 69.2003 },
          { nameUz: "Chinoz tumani", nameEn: "Chinaz District", nameRu: "Чиназский район", lat: 40.9328, lng: 68.7564 },
          { nameUz: "Qibray tumani", nameEn: "Kibray District", nameRu: "Кибрайский район", lat: 41.3853, lng: 69.4622 },
          { nameUz: "Parkent tumani", nameEn: "Parkent District", nameRu: "Паркентский район", lat: 41.2944, lng: 69.6739 },
          { nameUz: "Piskent tumani", nameEn: "Piskent District", nameRu: "Пскентский район", lat: 40.8986, lng: 69.3514 },
          { nameUz: "Quyi Chirchiq tumani", nameEn: "Quyi Chirchiq District", nameRu: "Куйичирчикский район", lat: 40.9167, lng: 68.9167 },
          { nameUz: "O'rtachirchiq tumani", nameEn: "Urtachirchiq District", nameRu: "Уртачирчикский район", lat: 41.0828, lng: 69.3486 },
          { nameUz: "Yangiyo'l tumani", nameEn: "Yangiyul District", nameRu: "Янгиюльский район", lat: 41.1308, lng: 69.0436 },
          { nameUz: "Yuqori Chirchiq tumani", nameEn: "Yuqori Chirchiq District", nameRu: "Юкоричирчикский район", lat: 41.3094, lng: 69.6019 },
          { nameUz: "Zangiota tumani", nameEn: "Zangiata District", nameRu: "Зангиатинский район", lat: 41.2333, lng: 69.1500 },
          { nameUz: "Toshkent tumani", nameEn: "Tashkent District", nameRu: "Ташкентский район", lat: 41.3986, lng: 69.1983 }
        ]
      },
      {
        nameUz: "Samarqand",
        nameEn: "Samarkand",
        nameRu: "Самарканд",
        lat: 39.6542,
        lng: 66.9597,
        districts: [
          { nameUz: "Samarqand shahri", nameEn: "Samarkand City", nameRu: "город Самарканд", lat: 39.6542, lng: 66.9597 },
          { nameUz: "Urgut tumani", nameEn: "Urgut District", nameRu: "Ургутский район", lat: 39.4056, lng: 67.2436 },
          { nameUz: "Pastdarg'om tumani", nameEn: "Pastdargom District", nameRu: "Пастдаргомский район", lat: 39.6975, lng: 66.6917 },
          { nameUz: "Bulung'ur tumani", nameEn: "Bulungur District", nameRu: "Булунгурский район", lat: 39.7578, lng: 67.2750 },
          { nameUz: "Ishtixon tumani", nameEn: "Ishtikhon District", nameRu: "Иштыханский район", lat: 40.1167, lng: 66.4833 },
          { nameUz: "Jomboy tumani", nameEn: "Jomboy District", nameRu: "Джамбайский район", lat: 39.6972, lng: 67.0911 },
          { nameUz: "Kattaqo'rg'on tumani", nameEn: "Kattakurgan District", nameRu: "Каттакурганский район", lat: 39.8975, lng: 66.2558 },
          { nameUz: "Narpay tumani", nameEn: "Narpay District", nameRu: "Нарпайский район", lat: 40.0333, lng: 66.0500 },
          { nameUz: "Nurobod tumani", nameEn: "Nurobod District", nameRu: "Нурабадский район", lat: 39.6083, lng: 66.2750 },
          { nameUz: "Oqdaryo tumani", nameEn: "Oqdaryo District", nameRu: "Акдарьинский район", lat: 39.8333, lng: 66.8333 },
          { nameUz: "Paxtachi tumani", nameEn: "Pakhtachi District", nameRu: "Пахтачийский район", lat: 40.0219, lng: 65.7558 },
          { nameUz: "Payariq tumani", nameEn: "Payariq District", nameRu: "Пайарыкский район", lat: 40.1611, lng: 66.8483 },
          { nameUz: "Toyloq tumani", nameEn: "Toyloq District", nameRu: "Тайлакский район", lat: 39.5986, lng: 67.0828 },
          { nameUz: "Qo'shrabot tumani", nameEn: "Koshrabot District", nameRu: "Кошрабадский район", lat: 40.2675, lng: 66.3014 }
        ]
      },
      {
        nameUz: "Buxoro",
        nameEn: "Bukhara",
        nameRu: "Бухара",
        lat: 39.7747,
        lng: 64.4286,
        districts: [
          { nameUz: "Buxoro shahri", nameEn: "Bukhara City", nameRu: "город Бухара", lat: 39.7747, lng: 64.4286 },
          { nameUz: "Gijduvon tumani", nameEn: "Gijduvon District", nameRu: "Гиждуванский район", lat: 40.1009, lng: 64.6761 },
          { nameUz: "Kogon tumani", nameEn: "Kagan District", nameRu: "Каганский район", lat: 39.7156, lng: 64.5428 },
          { nameUz: "Olot tumani", nameEn: "Alat District", nameRu: "Алатский район", lat: 39.4183, lng: 63.8058 },
          { nameUz: "Qorako'l tumani", nameEn: "Karakul District", nameRu: "Каракульский район", lat: 39.5167, lng: 63.8583 },
          { nameUz: "Romitan tumani", nameEn: "Romitan District", nameRu: "Ромитанский район", lat: 40.1167, lng: 64.0833 },
          { nameUz: "Shofirkon tumani", nameEn: "Shofirkon District", nameRu: "Шафирканский район", lat: 40.1259, lng: 64.5019 },
          { nameUz: "Vobkent tumani", nameEn: "Vobkent District", nameRu: "Вабкентский район", lat: 40.0211, lng: 64.5167 },
          { nameUz: "Peshku tumani", nameEn: "Peshku District", nameRu: "Пешкунский район", lat: 40.3558, lng: 64.2983 },
          { nameUz: "Jondor tumani", nameEn: "Jondor District", nameRu: "Жондорский район", lat: 39.7428, lng: 64.1833 }
        ]
      },
      {
        nameUz: "Navoiy",
        nameEn: "Navoiy",
        nameRu: "Навои",
        lat: 40.0844,
        lng: 65.3792,
        districts: [
          { nameUz: "Navoiy shahri", nameEn: "Navoiy City", nameRu: "город Навои", lat: 40.0844, lng: 65.3792 },
          { nameUz: "Zarafshon shahri", nameEn: "Zarafshan City", nameRu: "город Зарафшан", lat: 41.5739, lng: 64.2158 },
          { nameUz: "Karmana tumani", nameEn: "Karmana District", nameRu: "Карманинский район", lat: 40.1389, lng: 65.3719 },
          { nameUz: "Qiziltepa tumani", nameEn: "Kiziltepa District", nameRu: "Кызылтепинский район", lat: 40.0333, lng: 64.8500 },
          { nameUz: "Xatirchi tumani", nameEn: "Khatirchi District", nameRu: "Хатырчинский район", lat: 40.1833, lng: 65.9833 },
          { nameUz: "Nurota tumani", nameEn: "Nurota District", nameRu: "Нуратинский район", lat: 40.5658, lng: 65.6842 },
          { nameUz: "Uchquduq tumani", nameEn: "Uchkuduk District", nameRu: "Учкудукский район", lat: 42.1583, lng: 63.5500 }
        ]
      },
      {
        nameUz: "Qashqadaryo",
        nameEn: "Kashkadarya",
        nameRu: "Кашкадарья",
        lat: 38.8612,
        lng: 65.7847,
        districts: [
          { nameUz: "Qarshi shahri", nameEn: "Karshi City", nameRu: "город Карши", lat: 38.8612, lng: 65.7847 },
          { nameUz: "Shahrisabz shahri", nameEn: "Shahrisabz City", nameRu: "город Шахрисабз", lat: 39.0558, lng: 66.8319 },
          { nameUz: "Kitob tumani", nameEn: "Kitob District", nameRu: "Китабский район", lat: 39.1333, lng: 66.8833 },
          { nameUz: "Chiroqchi tumani", nameEn: "Chiroqchi District", nameRu: "Чиракчинский район", lat: 39.0333, lng: 66.5667 },
          { nameUz: "G'uzor tumani", nameEn: "Guzar District", nameRu: "Гузарский район", lat: 38.6214, lng: 66.2415 },
          { nameUz: "Koson tumani", nameEn: "Koson District", nameRu: "Касанский район", lat: 39.0436, lng: 65.5728 },
          { nameUz: "Muborak tumani", nameEn: "Muborak District", nameRu: "Мубарекский район", lat: 39.2614, lng: 65.1528 },
          { nameUz: "Qamashi tumani", nameEn: "Qamashi District", nameRu: "Камашинский район", lat: 38.8167, lng: 66.4667 },
          { nameUz: "Yakkabag' tumani", nameEn: "Yakkabag District", nameRu: "Яккабагский район", lat: 38.9833, lng: 66.6833 }
        ]
      },
      {
        nameUz: "Surxondaryo",
        nameEn: "Surkhandarya",
        nameRu: "Сурхандарья",
        lat: 37.2272,
        lng: 67.2783,
        districts: [
          { nameUz: "Termiz shahri", nameEn: "Termez City", nameRu: "город Термез", lat: 37.2272, lng: 67.2783 },
          { nameUz: "Denov tumani", nameEn: "Denov District", nameRu: "Денауский район", lat: 38.2675, lng: 67.9014 },
          { nameUz: "Boysun tumani", nameEn: "Boysun District", nameRu: "Байсунский район", lat: 38.1983, lng: 67.1986 },
          { nameUz: "Sherobod tumani", nameEn: "Sherobod District", nameRu: "Шерабадский район", lat: 37.6719, lng: 67.0125 },
          { nameUz: "Sho'rchi tumani", nameEn: "Shurchi District", nameRu: "Шурчинский район", lat: 38.0039, lng: 67.7891 },
          { nameUz: "Jarqo'rg'on tumani", nameEn: "Jarqurgan District", nameRu: "Джаркурганский район", lat: 37.5028, lng: 67.4111 },
          { nameUz: "Sariosiyo tumani", nameEn: "Sariosiyo District", nameRu: "Сариасийский район", lat: 38.3853, lng: 67.9422 }
        ]
      },
      {
        nameUz: "Jizzax",
        nameEn: "Jizzakh",
        nameRu: "Джизак",
        lat: 40.1158,
        lng: 67.8422,
        districts: [
          { nameUz: "Jizzax shahri", nameEn: "Jizzakh City", nameRu: "город Джизак", lat: 40.1158, lng: 67.8422 },
          { nameUz: "Sharof Rashidov tumani", nameEn: "Sharof Rashidov District", nameRu: "Шараф-Рашидовский район", lat: 40.0828, lng: 67.8111 },
          { nameUz: "Zamin tumani", nameEn: "Zaamin District", nameRu: "Зааминский район", lat: 39.9575, lng: 68.3986 },
          { nameUz: "Gallaorol tumani", nameEn: "Gallaorol District", nameRu: "Галляаральский район", lat: 40.0194, lng: 67.5853 },
          { nameUz: "Baxmal tumani", nameEn: "Baxmal District", nameRu: "Бахмальский район", lat: 39.8111, lng: 67.6328 },
          { nameUz: "Forish tumani", nameEn: "Forish District", nameRu: "Форишский район", lat: 40.5658, lng: 67.1259 }
        ]
      },
      {
        nameUz: "Sirdaryo",
        nameEn: "Syrdarya",
        nameRu: "Сырдарья",
        lat: 40.5015,
        lng: 68.6657,
        districts: [
          { nameUz: "Guliston shahri", nameEn: "Gulistan City", nameRu: "город Гулистан", lat: 40.5015, lng: 68.6657 },
          { nameUz: "Sirdaryo tumani", nameEn: "Syrdarya District", nameRu: "Сырдарьинский район", lat: 40.8528, lng: 68.6639 },
          { nameUz: "Boyovut tumani", nameEn: "Boyovut District", nameRu: "Баяутский район", lat: 40.3858, lng: 69.0111 },
          { nameUz: "Sayxunobod tumani", nameEn: "Saykhunobod District", nameRu: "Сайхунабадский район", lat: 40.6125, lng: 68.9111 },
          { nameUz: "Xovos tumani", nameEn: "Khavast District", nameRu: "Хавастский район", lat: 40.1583, lng: 68.9419 }
        ]
      },
      {
        nameUz: "Andijon",
        nameEn: "Andijan",
        nameRu: "Андижан",
        lat: 40.7821,
        lng: 72.3442,
        districts: [
          { nameUz: "Andijon shahri", nameEn: "Andijan City", nameRu: "город Андижан", lat: 40.7821, lng: 72.3442 },
          { nameUz: "Asaka tumani", nameEn: "Asaka District", nameRu: "Асакинский район", lat: 40.6415, lng: 72.2415 },
          { nameUz: "Shahrixon tumani", nameEn: "Shahrixon District", nameRu: "Шахриханский район", lat: 40.7111, lng: 72.0558 },
          { nameUz: "Xo'jaobod tumani", nameEn: "Khojaobod District", nameRu: "Ходжаабадский район", lat: 40.6694, lng: 72.5694 },
          { nameUz: "Qo'rg'ontepa tumani", nameEn: "Qurgontepa District", nameRu: "Кургантепинский район", lat: 40.7333, lng: 72.7667 },
          { nameUz: "Baliqchi tumani", nameEn: "Baliqchi District", nameRu: "Балыкчинский район", lat: 40.9328, lng: 71.9167 }
        ]
      },
      {
        nameUz: "Namangan",
        nameEn: "Namangan",
        nameRu: "Наманган",
        lat: 40.9983,
        lng: 71.6726,
        districts: [
          { nameUz: "Namangan shahri", nameEn: "Namangan City", nameRu: "город Наманган", lat: 40.9983, lng: 71.6726 },
          { nameUz: "Chust tumani", nameEn: "Chust District", nameRu: "Чустский район", lat: 41.0111, lng: 71.2223 },
          { nameUz: "Kosonsoy tumani", nameEn: "Kosonsoy District", nameRu: "Касансайский район", lat: 41.2558, lng: 71.5519 },
          { nameUz: "Pop tumani", nameEn: "Pap District", nameRu: "Папский район", lat: 41.0125, lng: 70.9386 },
          { nameUz: "To'raqo'rg'on tumani", nameEn: "Turaqurgan District", nameRu: "Туракурганский район", lat: 41.0028, lng: 71.5111 },
          { nameUz: "Uchqo'rg'on tumani", nameEn: "Uchqurgan District", nameRu: "Учкурганский район", lat: 41.1111, lng: 72.0833 }
        ]
      },
      {
        nameUz: "Farg'ona",
        nameEn: "Fergana",
        nameRu: "Фергана",
        lat: 40.3864,
        lng: 71.7864,
        districts: [
          { nameUz: "Farg'ona shahri", nameEn: "Fergana City", nameRu: "город Фергана", lat: 40.3864, lng: 71.7864 },
          { nameUz: "Marg'ilon shahri", nameEn: "Margilan City", nameRu: "город Маргилан", lat: 40.4858, lng: 71.7242 },
          { nameUz: "Qo'qon shahri", nameEn: "Kokand City", nameRu: "город Коканд", lat: 40.5286, lng: 70.9422 },
          { nameUz: "Rishton tumani", nameEn: "Rishtan District", nameRu: "Риштанский район", lat: 40.3558, lng: 71.2783 },
          { nameUz: "Oltiariq tumani", nameEn: "Oltiariq District", nameRu: "Алтыарыкский район", lat: 40.3986, lng: 71.4986 },
          { nameUz: "Quva tumani", nameEn: "Quva District", nameRu: "Кувинский район", lat: 40.5222, lng: 72.0083 }
        ]
      },
      {
        nameUz: "Xorazm",
        nameEn: "Khorezm",
        nameRu: "Хорезм",
        lat: 41.5542,
        lng: 60.6277,
        districts: [
          { nameUz: "Urganch shahri", nameEn: "Urgench City", nameRu: "город Ургенч", lat: 41.5542, lng: 60.6277 },
          { nameUz: "Xiva shahri", nameEn: "Khiva City", nameRu: "город Хива", lat: 41.3783, lng: 60.3578 },
          { nameUz: "Xazorasp tumani", nameEn: "Khazarasp District", nameRu: "Хазараспский район", lat: 41.3111, lng: 61.0833 },
          { nameUz: "Shovot tumani", nameEn: "Shavat District", nameRu: "Шаватский район", lat: 41.6583, lng: 60.2986 },
          { nameUz: "Gurlan tumani", nameEn: "Gurlan District", nameRu: "Гурленский район", lat: 41.8383, lng: 60.5833 }
        ]
      },
      {
        nameUz: "Qoraqalpog'iston Respublikasi",
        nameEn: "Karakalpakstan",
        nameRu: "Каракалпакстан",
        lat: 42.4647,
        lng: 59.6019,
        districts: [
          { nameUz: "Nukus shahri", nameEn: "Nukus City", nameRu: "город Нукус", lat: 42.4647, lng: 59.6019 },
          { nameUz: "Qo'ng'irot tumani", nameEn: "Kungrad District", nameRu: "Кунградский район", lat: 43.0828, lng: 58.8419 },
          { nameUz: "To'rtko'l tumani", nameEn: "Turtkul District", nameRu: "Турткульский район", lat: 41.5558, lng: 61.0111 },
          { nameUz: "Beruniy tumani", nameEn: "Beruni District", nameRu: "Берунийский район", lat: 41.6983, lng: 60.7558 },
          { nameUz: "Ellikqal'a tumani", nameEn: "Ellikqala District", nameRu: "Элликкалинский район", lat: 41.8111, lng: 60.8528 }
        ]
      }
    ]
  },
  {
    code: "KZ",
    nameUz: "Qozog'iston",
    nameEn: "Kazakhstan",
    nameRu: "Казахстан",
    lat: 48.0196,
    lng: 66.9237,
    regions: [
      {
        nameUz: "Almati",
        nameEn: "Almaty",
        nameRu: "Алматы",
        lat: 43.2389,
        lng: 76.8897,
        districts: [
          { nameUz: "Bostandiq tumani", nameEn: "Bostandyk District", nameRu: "Бостандыкский район", lat: 43.2189, lng: 76.8997 },
          { nameUz: "Almali tumani", nameEn: "Almaly District", nameRu: "Алмалинский район", lat: 43.2542, lng: 76.9111 },
          { nameUz: "Medeu tumani", nameEn: "Medeu District", nameRu: "Медеуский район", lat: 43.2436, lng: 76.9558 }
        ]
      },
      {
        nameUz: "Astana",
        nameEn: "Astana",
        nameRu: "Астана",
        lat: 51.1693,
        lng: 71.4490,
        districts: [
          { nameUz: "Almati tumani", nameEn: "Almaty District", nameRu: "Алматинский район", lat: 51.1893, lng: 71.4983 },
          { nameUz: "Yesil tumani", nameEn: "Yesil District", nameRu: "Есильский район", lat: 51.1293, lng: 71.4283 },
          { nameUz: "Sariarka tumani", nameEn: "Saryarka District", nameRu: "Сарыаркинский район", lat: 51.1793, lng: 71.3983 }
        ]
      }
    ]
  },
  {
    code: "KG",
    nameUz: "Qirg'iziston",
    nameEn: "Kyrgyzstan",
    nameRu: "Кыргызстан",
    lat: 41.2044,
    lng: 74.7661,
    regions: [
      {
        nameUz: "Bishkek shahri",
        nameEn: "Bishkek City",
        nameRu: "город Бишкек",
        lat: 42.8746,
        lng: 74.5698,
        districts: [
          { nameUz: "Lenin tumani", nameEn: "Lenin District", nameRu: "Ленинский район", lat: 42.8646, lng: 74.5298 },
          { nameUz: "Oktabr tumani", nameEn: "Oktyabr District", nameRu: "Октябрьский район", lat: 42.8446, lng: 74.6098 }
        ]
      }
    ]
  },
  {
    code: "TJ",
    nameUz: "Tojikiston",
    nameEn: "Tajikistan",
    nameRu: "Таджикистан",
    lat: 38.8610,
    lng: 71.2761,
    regions: [
      {
        nameUz: "Dushanbe shahri",
        nameEn: "Dushanbe",
        nameRu: "Душанбе",
        lat: 38.5598,
        lng: 68.7870,
        districts: [
          { nameUz: "Ismoili Somoni", nameEn: "Ismoili Somoni", nameRu: "Исмоили Сомони", lat: 38.5798, lng: 68.7970 },
          { nameUz: "Sino tumani", nameEn: "Sino District", nameRu: "Сино район", lat: 38.5498, lng: 68.7570 }
        ]
      }
    ]
  },
  {
    code: "TR",
    nameUz: "Turkiya",
    nameEn: "Turkey",
    nameRu: "Турция",
    lat: 38.9637,
    lng: 35.2433,
    regions: [
      {
        nameUz: "Istanbul",
        nameEn: "Istanbul",
        nameRu: "Стамбул",
        lat: 41.0082,
        lng: 28.9784,
        districts: [
          { nameUz: "Fatih", nameEn: "Fatih", nameRu: "Фатих", lat: 41.0182, lng: 28.9484 },
          { nameUz: "Kadikoy", nameEn: "Kadikoy", nameRu: "Кадикой", lat: 40.9910, lng: 29.0250 },
          { nameUz: "Besiktas", nameEn: "Besiktas", nameRu: "Бешикташ", lat: 41.0423, lng: 29.0076 }
        ]
      }
    ]
  },
  {
    code: "AE",
    nameUz: "BAA (Dubai)",
    nameEn: "UAE (Dubai)",
    nameRu: "ОАЭ (Дубай)",
    lat: 23.4241,
    lng: 53.8478,
    regions: [
      {
        nameUz: "Abu Dabi",
        nameEn: "Abu Dhabi",
        nameRu: "Абу-Даби",
        lat: 24.4539,
        lng: 54.3773,
        districts: [
          { nameUz: "Al Khalidiyah", nameEn: "Al Khalidiyah", nameRu: "Аль-Халидия", lat: 24.4639, lng: 54.3473 }
        ]
      },
      {
        nameUz: "Dubai",
        nameEn: "Dubai",
        nameRu: "Дубай",
        lat: 25.2048,
        lng: 55.2708,
        districts: [
          { nameUz: "Downtown Dubai", nameEn: "Downtown Dubai", nameRu: "Даунтаун Дубай", lat: 25.1972, lng: 55.2744 },
          { nameUz: "Dubai Marina", nameEn: "Dubai Marina", nameRu: "Дубай Марина", lat: 25.0772, lng: 55.1308 }
        ]
      }
    ]
  },
  {
    code: "US",
    nameUz: "AQSh",
    nameEn: "United States",
    nameRu: "США",
    lat: 37.0902,
    lng: -95.7129,
    regions: [
      {
        nameUz: "Kalliforniya",
        nameEn: "California",
        nameRu: "Калифорния",
        lat: 36.7783,
        lng: -119.4179,
        districts: [
          { nameUz: "Los Anjeles", nameEn: "Los Angeles", nameRu: "Лос-Анджелес", lat: 34.0522, lng: -118.2437 },
          { nameUz: "San Fransisko", nameEn: "San Francisco", nameRu: "Сан-Франциско", lat: 37.7749, lng: -122.4194 }
        ]
      },
      {
        nameUz: "Nyu York",
        nameEn: "New York",
        nameRu: "Нью-Йорк",
        lat: 40.7128,
        lng: -74.0060,
        districts: [
          { nameUz: "Manxetten", nameEn: "Manhattan", nameRu: "Манхэттен", lat: 40.7831, lng: -73.9712 },
          { nameUz: "Bruklin", nameEn: "Brooklyn", nameRu: "Бруклин", lat: 40.6782, lng: -73.9442 }
        ]
      }
    ]
  }
];
