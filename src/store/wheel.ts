import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

const savedNames = localStorage.getItem('names')
const savedTheme = JSON.parse(localStorage.getItem('theme'))

export const themes = {
  Default: {
    Default: ['#3369E8', '#D50F25', '#EEB211', '#009925'],
    'The world stands with Ukraine': ['#0057B8', '#FFD700']
  },
  Nature: {
    'Antarctica evening': ['#F4D3C4', '#F2AEBB', '#D895DA', '#A091D6', '#696FC7', '#A7AAE1'],
    'Beach sunset': ['#3C47C6', '#656CDE', '#DE6CC8', '#F8A091', '#F7E392', '#F7A55D'],
    'Desert scene': ['#FAD381', '#D79F62', '#2E4647', '#518D6A', '#9BC692'],
    'Evening sky': ['#001F38', '#526079', '#9A7E8E', '#E3757F', '#FD997F', '#FFD0AA'],
    'Fresh meadow': ['#84A013', '#A8BB2E', '#D4DA5E', '#EBEF90', '#FBFDBC', '#FAC703'],
    'Fruit tones': ['#E9692C', '#ED9121', '#FFC324', '#FFF000', '#66B447', '#8EE53F'],
    Giraffe: ['#F0ECE1', '#EDCF8F', '#C97F4E', '#6F4A38', '#977359'],
    Jellyfish: ['#3EA1B6', '#0E6B8C', '#133855', '#6B669E', '#BB90C8', '#EFD8EC'],
    Jungle: ['#135E46', '#478966', '#73A788', '#E3C6AD', '#D09D7B', '#B67B65'],
    'Koi fish': ['#F16323', '#F2F3F4', '#FFD021', '#E34427'],
    Monsoon: ['#01A8CA', '#32D1EC', '#F1F1F1', '#AFDFF3'],
    Moon: ['#31302E', '#94908D', '#DAD9D7', '#F0F0F0', '#C3C2BE'],
    'Purple horizon': ['#B7B8F9', '#3A1F8A', '#2C1357', '#462867', '#593B6A'],
    Rainbow: ['#5E02E9', '#3C70EF', '#30D800', '#E7E200', '#FD8B00', '#F20800'],
    'Red desert': ['#99857A', '#C67B5C', '#E27B58', '#FF9D6F', '#663926', '#8E6A5A'],
    'Red sunset': ['#761000', '#C10900', '#E92100', '#FFDB53', '#FFA93D', '#FF7A29'],
    'Sandy beach': ['#9FE2BF', '#FFE5C6', '#EFCDB4', '#4BC7CF', '#5CF5FF'],
    Sun: ['#FFFFFF', '#FFE484', '#FFCC33', '#FC9601', '#D14009'],
    Underwater: ['#4F42B5', '#82E1E3', '#D4F1F9', '#E3FFFA', '#4CC395'],
    'Water lilies': ['#448036', '#5C9550', '#FBBA37', '#EE6BA4', '#F192B5', '#F4B0C7']
  },
  Seasons: {
    'Fall green': ['#529106', '#61A307', '#86B71B', '#B9BD00', '#8EA202', '#799203'],
    'Fall leaves': ['#BA4634', '#D85C4E', '#EAA250', '#F5DD8B', '#CEC218', '#5F7818'],
    'Fall road': ['#A05A48', '#563633', '#6D463C', '#D6BD9D', '#D19E6D', '#C57D56'],
    'Fall yellow': ['#DC7C00', '#FF9705', '#FEB20A', '#FFCB00', '#FEDF05'],
    'Spring gentle': ['#C3D4C1', '#FFFFE5', '#B4D2A4', '#95BC83', '#F6EAD3'],
    'Spring green beauty': ['#F99825', '#F5C527', '#CFFA6B', '#9EEC1C', '#89DF42', '#75CB00'],
    'Spring pastels': ['#94DE8B', '#B19CD9', '#F4A8CF', '#F4C3D7', '#FDFD96', '#B6E7B9'],
    'Spring pink': ['#E25157', '#F5808F', '#FFACCC', '#FFCBDF', '#EBF0EA', '#93C64E'],
    'Summer buzz': ['#3BAED5', '#5CC8E2', '#FDE683', '#E66C1E', '#D52210'],
    'Summer carnival': ['#01A7EC', '#FFFF46', '#FFC94B', '#FE8F5D', '#FE47B3', '#80DA65'],
    'Summer is hot': ['#BF221C', '#E8681F', '#FBC44F', '#FFE67F', '#FDFFD2', '#F9F500'],
    'Summer pool party': ['#0198F1', '#49C2FF', '#A9EEFF', '#0067D4', '#E999DE', '#7C62C4'],
    'Winter blues': ['#2377A4', '#50A3C6', '#79C0D7', '#F8F8F8', '#DDDFDF', '#C2C2C2'],
    'Winter camouflage': ['#7C7C7C', '#0E1317', '#ACDEF8', '#344A78', '#FDFAFC', '#D6D6D6'],
    'Winter growth': ['#383159', '#656DA6', '#C5E1F2', '#52734F'],
    'Winter wonderland': ['#23644D', '#D3F1F3', '#FFFFFF', '#E22A45', '#C7102E']
  },
  Abstract: {
    'Anonymous citation': ['#9DC3CA', '#B7D4C6', '#B7D4C6', '#EFECE1', '#EDD5C8', '#F2C0C5'],
    'Black to blue': ['#010101', '#011926', '#003E5C', '#016293', '#007BB8'],
    'Centered truth': ['#775E56', '#E4E1AF', '#FF9263', '#FF6455', '#7C687D'],
    'Cool blues &amp; oranges': ['#3C8BEC', '#7EBEF6', '#FED8B1', '#F88102', '#F95701'],
    'Dead ennui': ['#85A18C', '#F6FDDF', '#FFECCD', '#F2B783'],
    'Information blues': ['#90B0AB', '#CBCAC0', '#DEDAD6', '#5F729A'],
    'Lavender to dark blue': ['#FFBAFF', '#DE87FF', '#A455FF', '#681DFF', '#1000CA', '#000098'],
    'Offbeat recognition': ['#F1647A', '#F3F1DB', '#74CBCC', '#27ABB2', '#C1D765', '#80C544'],
    'Office hours': ['#DE7373', '#F0DC9F', '#DEBB89', '#7787AE', '#43487B'],
    'Party fun': ['#891180', '#EA27A2', '#FB9390', '#F6C892', '#FFF5BD', '#FDFFDE'],
    'Pastel tones': ['#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3'],
    'Perfect feminine': ['#C09BE3', '#F6E0C7', '#F0C589', '#EA9A5D', '#EA6D63', '#E33F64'],
    'Slumber party': ['#278DF0', '#FFEF93', '#FF96E1', '#9B78FC'],
    'Teasing questions': ['#C75589', '#E369A4', '#F5CC22', '#F6EF2D', '#B2E792', '#82D07B'],
    'Turquoise to blue': ['#00FEEF', '#09EBEE', '#19CEEB', '#28ACEA', '#388EE9', '#3D76E0']
  },
  Flags: {
    Afghanistan: ['#000000', '#D32011', '#FFFFFF', '#007A36'],
    Algeria: ['#006633', '#FFFFFF', '#D21034'],
    Angola: ['#CC092F', '#000000', '#FFCB00'],
    Argentina: ['#6CACE4', '#FFB81C', '#FFFFFF'],
    Australia: ['#012169', '#E4002B', '#FFFFFF'],
    'Australia-Aboriginal': ['#000000', '#CC0000', '#FFFF00'],
    Bangladesh: ['#F42A41', '#006A4E'],
    Belgium: ['#2D2926', '#FFCD00', '#C8102E'],
    Brazil: ['#009739', '#FEDD00', '#012169'],
    'Burkina Faso': ['#EF3340', '#FFCD00', '#009739'],
    Cambodia: ['#032EA1', '#E00025', '#FFFFFF', '#000000'],
    Cameroon: ['#007A5E', '#CE1126', '#FCD116'],
    Canada: ['#D80621', '#FFFFFF'],
    Chile: ['#0033A0', '#DA291C', '#FFFFFF'],
    China: ['#EE1C25', '#FFFF00'],
    Colombia: ['#FFCD00', '#003087', '#C8102E'],
    "Côte d'Ivoire": ['#FF8200', '#FFFFFF', '#009A44'],
    Denmark: ['#C8102E', '#FFFFFF'],
    'DR Congo': ['#0085CA', '#EF3340', '#FFD100'],
    Ecuador: ['#FFD100', '#0072CE', '#EF3340'],
    Egypt: ['#C8102E', '#FFFFFF', '#C09300', '#000000'],
    Ethiopia: ['#009A44', '#FEDD00', '#EF3340', '#0645B1'],
    Finland: ['#002F6C', '#FFFFFF'],
    France: ['#002395', '#FFFFFF', '#ED2939'],
    Germany: ['#000000', '#DD0000', '#FFCE00'],
    Ghana: ['#EF3340', '#FFD100', '#009739', '#000000'],
    Greece: ['#001489', '#FFFFFF'],
    Guatemala: ['#4997D0', '#FFFFFF'],
    'Hong Kong': ['#DE2910', '#FFFFFF'],
    India: ['#FF9933', '#FFFFFF', '#138808', '#000080'],
    Indonesia: ['#FF0000', '#FFFFFF'],
    Iran: ['#009639', '#FFFFFF', '#C8102E'],
    Iraq: ['#CE1126', '#FFFFFF', '#007A3D', '#000000'],
    Ireland: ['#169B62', '#FFFFFF', '#FF883E'],
    Italy: ['#008C45', '#F4F5F0', '#CD212A'],
    Japan: ['#FFFFFF', '#BC002D'],
    Kazakhstan: ['#00AEC7', '#F6E500'],
    Kenya: ['#BE3A34', '#009A44', '#000000'],
    Lithuania: ['#FDB913', '#006A44', '#C1272D'],
    Madagascar: ['#FFFFFF', '#F9423A', '#00843D'],
    Malawi: ['#C8102E', '#007A33', '#000000'],
    Malaysia: ['#010066', '#CC0001', '#FFFFFF', '#FFCC00'],
    Mali: ['#009639', '#FFD100', '#EF3340'],
    Maori: ['#000000', '#FFFFFF', '#D40000'],
    Mexico: ['#006341', '#FFFFFF', '#CE1126'],
    Morocco: ['#C1272D', '#006233'],
    Mozambique: ['#009639', '#E4002B', '#FFD100', '#000000'],
    Myanmar: ['#FFCD00', '#43B02A', '#EE2737', '#FFFFFF'],
    Nepal: ['#C8102E', '#003087', '#FFFFFF'],
    Netherlands: ['#AE1C28', '#FFFFFF', '#21468B'],
    'New Zealand': ['#00247D', '#FFFFFF', '#CC142B'],
    Niger: ['#FFB25B', '#FFFFFF', '#009639'],
    Nigeria: ['#009639', '#FFFFFF'],
    'North Korea': ['#BF0D3E', '#005EB8', '#FFFFFF'],
    Norway: ['#C8102E', '#FFFFFF', '#003087'],
    Pakistan: ['#115740', '#FFFFFF'],
    'Pan-Africa': ['#E31B23', '#000000', '#12853F'],
    Peru: ['#C8102E', '#FFFFFF'],
    Philippines: ['#FCD116', '#0038A8', '#CE1126', '#FFFFFF'],
    Poland: ['#FFFFFF', '#D22630'],
    Rasta: ['#078930', '#FCDD09', '#DA121A'],
    Romania: ['#012169', '#FFCD00', '#C8102E'],
    Russia: ['#FFFFFF', '#0072CE', '#EF3340'],
    'Saudi Arabia': ['#006C35', '#FFFFFF'],
    Senegal: ['#009639', '#FFD100', '#EF3340'],
    Singapore: ['#EF3340', '#FFFFFF'],
    'South Africa': ['#007749', '#000000', '#FFFFFF', '#FFB81C', '#E03C31', '#001489'],
    'South Korea': ['#FFFFFF', '#C8102E', '#002F6C', '#000000'],
    Spain: ['#AA151B', '#F1BF00'],
    'Sri Lanka': ['#FFD100', '#43B02A', '#FFB25B', '#9B2743'],
    Sudan: ['#EF3340', '#009639', '#FFFFFF', '#000000'],
    Sweden: ['#004B87', '#FFCD00'],
    Syria: ['#EF3340', '#FFFFFF', '#009639', '#000000'],
    Taiwan: ['#000097', '#FFFFFF', '#FE0000'],
    Tanzania: ['#43B02A', '#FFCD00', '#00A3E0', '#000000'],
    Thailand: ['#A51931', '#F4F5F8', '#2D2A4A'],
    Turkey: ['#C8102E', '#FFFFFF'],
    Uganda: ['#000000', '#FFD100', '#EF3340'],
    Ukraine: ['#0057B8', '#FFD700'],
    'United Arab Emirates': ['#FF0000', '#00732F', '#FFFFFF', '#000000'],
    'United Kingdom': ['#00247D', '#FFFFFF', '#CF142B'],
    'United States': ['#3C3B6E', '#FFFFFF', '#B22234'],
    Uzbekistan: ['#0072CE', '#DA291C', '#FFFFFF', '#43B02A'],
    Venezuela: ['#FCE300', '#003DA5', '#EF3340', '#FFFFFF'],
    Vietnam: ['#DA251D', '#FFCD00'],
    Yemen: ['#EF3340', '#FFFFFF', '#000000'],
    Zambia: ['#198A00', '#DE2010', '#000000', '#EF7D00']
  },
  Pride: {
    'Classic Rainbow': ['#D12229', '#F68A1E', '#FDE01A', '#007940', '#24408E', '#732982'],
    Asexual: ['#000000', '#A4A4A4', '#FFFFFF', '#810081'],
    Bisexual: ['#D60270', '#9B4F96', '#0038A8'],
    'Non-binary': ['#FCF431', '#FCFCFC', '#9D59D2', '#282828'],
    Transgender: ['#5BCFFB', '#F5ABB9', '#FFFFFF', '#F5ABB9']
  },
  Holidays: {
    Christmas: ['#348228', '#469A47', '#DAF7FF', '#FFFAFA', '#EB2029', '#D70816'],
    'Earth Day': ['#11205B', '#E9E9E9', '#8F705E', '#BF9269', '#F0C951', '#3C6F36'],
    Easter: ['#367D83', '#BADBD2', '#F47A97', '#F3EB9A', '#E9C05F'],
    Halloween: ['#F36A1F', '#F3861F', '#000000'],
    'New Year': ['#FFDF00', '#FFCC00', '#ECBD00', '#CC9900', '#B8860B'],
    "Saint Patrick's Day": ['#008001', '#228B22', '#00AD43'],
    Thanksgiving: ['#FDC149', '#E7A755', '#873826', '#61782A', '#D64F06', '#BBB300']
  },
  Games: {
    'Candy Crush': ['#D98121', '#EDB23F', '#F5D346', '#F7E1B4', '#FAF4DC', '#D3151C'],
    Candyland: ['#FBD7E7', '#EEDDEC', '#E1E3F1', '#D4E9F6', '#C7EFFB'],
    Fortnite: ['#E98F5C', '#B448F0', '#2AC9FA', '#F9E36E', '#C7C9D6'],
    'Mario &amp; Luigi': ['#5A98E1', '#139334', '#CEA900', '#FE130F', '#095CD4', '#16B65C'],
    Minecraft: ['#477A1E', '#70B237', '#8FCA5C', '#61371F', '#854F2B', '#C28340'],
    Monopoly: ['#C70000', '#BFDBAE', '#8FBC72', '#FFFFFF', '#D7BAAA'],
    Overwatch: ['#F79F11', '#3E474B', '#FFFFFF'],
    Pikachu: ['#FAD61D', '#E19720', '#F62D14', '#811E09', '#000000'],
    Pokémon: ['#0A285F', '#0075BE', '#D5A100', '#FFCC00'],
    'Rocket League': ['#008BFF', '#FF8B00']
  }
}

// Define the predicted winner type
export interface PredictedWinner {
  index: number;
  name: string;
  angle?: number;
  angleDegrees?: number;
}

// Define a type for the slice state
interface WheelState {
  names: string
  colors: string[]
  loading: boolean
  predictedWinner: PredictedWinner | null;
}

// Define the initial state using that type
const initialState: WheelState = {
  names:
    savedNames && savedNames !== ''
      ? savedNames
      : 'Ali\nBeatriz\nCharles\nDiya\nEric\nFatima\nGabriel\nHanna\n',
  colors: savedTheme?.length ? savedTheme : themes.Default.Default,
  loading: false,
  predictedWinner: null
}

export const wheelSlice = createSlice({
  name: 'wheel',
  initialState,
  reducers: {
    setNames: (state, action: PayloadAction<string>) => {
      state.names = action.payload
    },
    setColors: (state, action: PayloadAction<string[]>) => {
      state.colors = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setPredictedWinner: (state, action: PayloadAction<PredictedWinner | null>) => {
      state.predictedWinner = action.payload
    }
  }
})

export const { setNames, setColors, setLoading, setPredictedWinner } = wheelSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const names = (state: RootState) => state.wheel.names
export const predictedWinner = (state: RootState) => state.wheel.predictedWinner

export default wheelSlice.reducer
