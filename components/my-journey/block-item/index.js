Component({
  properties: {
    showTravelState: {
      type: Boolean,
      value: true
    },
    isDoubt: {
      type: Boolean,
      value: false
    },
    isHistoryDone: {
      type: Boolean,
      value: false
    },
    travelState: {
      type: String,
      value: '易到开放平台'
    },
    feePayed: {
      type: String,
      value: '' 
    },
    showCancel: {
      type: Boolean,
      value: false
    },
    isCompanyAccount: {
      type: Boolean,
      value: false
    },
    showTopTitle: {
      type: Boolean,
      value: true
    },
    dateTime: {
      type: String,
      value: '' 
    },
    showPassenger: {
      type: Boolean,
      value: false
    },
    passengerInfo: {
      type: String,
      value: '' 
    },
    showProblemTips: {
      type: Boolean,
      value: true
    },
    problemTips: {
      type: String,
      value: ''
    },
    showBottomTitle: {
      type: Boolean,
      value: false
    },
    bottomTitle: {
      type: String,
      value: ''
    },
    showBottomTitleRight: {
      type: Boolean,
      value: false
    },
    bottomTitleRight: {
      type: String,
      value: ''
    },
    showAddress: {
      type: Boolean,
      value: true
    },
    startAddress: {
      type: String,
      value: ''
    },
    endAddress: {
      type: String,
      value: ''
    },
    stateDesc: {
      type: String,
      value: ''
    },
    showFeePaying: {
      type: Boolean,
      value: false
    },
    feePaying: {
      type: String,
      value: ''
    },
  },
  externalClasses: ['custom-class'],
});