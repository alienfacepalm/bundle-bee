import * as types from '../actions/actionConstants.js';
import * as chart from '../constants/chartProperties.js';

const initialState = {
  screen: chart.SIZE,
  bundleType: chart.PARCEL, // CHANGE FOR DEBUGGING ONLY!
};

const chartReducer = (state = initialState, action) => {
  console.log("at chartReducer")
  console.log(state)

  switch (action.type) {
    case types.DISPLAY_SIZES:
      // const screen = chart.SIZE;
      return {
        ...state,
        screen: chart.SIZE};
    case types.DISPLAY_FACTORY_TIMES:
      return { 
        ...state,
        screen: chart.FACTORY_TIME};
    case types.DISPLAY_BUILDING_TIMES:
      return {
        ...state,
        screen: chart.BUILDING_TIME};

      // set different bundleType
    case types.DISPLAY_WEBPACK:
      return {
        ...state,
        bundleType: chart.WEBPACK};
    case types.DISPLAY_PARCEL:
      return {
        ...state,
        bundleType: chart.PARCEL,
        screen: chart.BUILDING_TIME};
    case types.DISPLAY_ROLLUP:
      return {
        ...state,
        bundleType: chart.ROLLUP,
        screen: chart.BUILDING_TIME};


      default:
      return state;
  }

};

export default chartReducer;

