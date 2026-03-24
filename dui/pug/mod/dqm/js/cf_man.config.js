$.page.fn.srcdocXX = [
  {type:'EMAIL', value:'srcem', text: 'Email Advise',source:'CUST'},
  {type:'DIRECT', value:'srcdirectContact', text: 'Direct Contact',source:'CUST'},
  {type:'SURVEY', value:'srccustSurvey', text: 'Customer Survey',source:'CUST'},
  {type:'PERCEPTION', value:'srcperception', text: 'Perception',source:'CUST'},
  
];

$.page.fn.srcdoc =[
	{"value":"CUSTADVICE","source":"CUST","text":"EMAIL ADVICE"},
	{"value":"CUSTDIRECT","source":"CUST","text":"DIRECT CONTACT"},
	{"value":"CUSTSURVEY","source":"CUST","text":"CUSTOMER SURVEY"},
	{"value":"CUSTPERCEPTION","source":"CUST","text":"PERCEPTION"}
];

$.page.fn.allstat = {
    
	  
    'GLOBAL':{
  		 page:'cf',
  		 formid:'dqm^comp^cf_man^CF'
  	},

  	'MATERIAL_REWORK':{
		data:[
		      {value:'ACTION',text:'Action'},
			  {value:'IMACTION',text:'Action immediately'},
			  {value:'CUSTDISC',text:'Customer Discussion/Visit req’d'},
			  {value:'HR',text:'HR Issue'},
			  {value:'LESSINFO',text:'Insufficient information'},
			  {value:'KIV',text:'Keep in View'},
			  {value:'MONITOR',text:'Monitor for more occurrences'},
			  {value:'NAR',text:'No action required'},
			  {value:'ONGOINGIMPROVE',text:'Ongoing improvement'},
			  {value:'CPAR',text:'Requires a CPAR'},
			  
             ]
	},
  	'PENDING': {    // New, My NCRs
    	asdpx: 'asx',
    	next: 'ASSIGNED',
    	tab:[0],
    	req:["SEVERITY","SUBJECT","REPORTED_BY","VERIFIED_BY","REMARKS"],
    	en:["SEVERITY","RECURRENCE","REPORTED_BY","VERIFIED_BY","REMARKS","VERIFIED_REMARKS","WOREF","SUBJECT","SERIAL_NUMBER","ORDER_NO","ORDER_ID","CP_NUMBER","EMPLOYEE_ID","WOREF_INSPECT_QTY","WOREF_REJECT_QTY","srcsel"],
    	stat:[{text:"PENDING",value:"PENDING"},{text:"TO VERIFY",value:"ASSIGNED"}],
    	auto: true,
    	date: '#CREATE_DATE',
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
    },

  	'ASSIGNED':{    // Verify
    	asdpx: 'asx',
    	next: 'VERIFIED',
    	tab:[1],
    	req:["DISPOSITION_BY","REVIEWED_BY","APPROVED_BY"],
    	en:["NCR_STATUS","REVIEWED_BY","APPROVED_BY","DISPOSITION_BY","REMARKS","VERIFIED_REMARKS"],
    	stat: [{text:"TO VERIFY",value:"ASSIGNED"},{text:"VERIFIED",value:"VERIFIED"},{text:"REJECTED",value:"REJECTED"}],
    	auto: true,
    	date: '#VERIFIED_DATE',
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
    },

  	'VERIFIED':{    //  Disposition
    	asdpx: 'asx',
    	next: 'TO_REVIEW',
    	tab:[2],
    	req:["DISPOSITION_REMARKS","DISPOSITION_MATERIAL"],
    	en:["DISPOSITION_REMARKS","DISPOSITION_MATERIAL","DISPOSITION_DOC_NO","REMARKS","VERIFIED_REMARKS"],
      stat: [{text:"FOR DISPOSITION",value:"VERIFIED"},{text:"FOR REVIEW",value:"TO_REVIEW"}],
    	auto: true,
    	date: '#DISPOSITION_DATE',
    	email: ['DISPOSITION_BY_EMAIL']
    },

    'TO_REVIEW':{    // Review
      asdpx: 'asx',
      next: 'REVIEWED',
      tab:[3],
      req:["CAUSE_ID","RA_REMARKS","CA_REMARKS",],
      en:["CAUSE_ID","RA_REMARKS","CA_REMARKS","NCR_STATUS"],
      stat:[{text:"TO APPROVE",value:"REVIEWED"},{text:"REJECTED",value:"REJECTED"}],
      auto: true,
      date: '#REVIEWED_DATE',
      email: ['REVIEWED_BY_EMAIL']
    },

  	'REVIEWED':{    // Approvals
    	asdpx: 'asx',
    	next: 'FOLLOWUP',
    	tab:[4],
    	req:["CAUSE_ID","RA_REMARKS","CA_REMARKS",],
    	en:["CAUSE_ID","RA_REMARKS","CA_REMARKS","NCR_STATUS"],
    	stat:[{text:"AWAITING APPROVAL",value:"REVIEWED"},{text:"FOLLOWUP",value:"FOLLOWUP"},{text:"COMPLETED",value:"COMPLETED"},{text:"REJECTED",value:"REJECTED"}],
    	auto: true,
		date: '#APPROVED_DATE',
    	statsel : function(rec){
        var ro=true; if(rec.value=='FOLLOWUP') var ro=false;
        $('#FOLLOWUP_BY').combobox('readonly',ro);
        $('#FOLLOWUP_BY').combobox('required',!ro);
    	},
    	email: ['APPROVED_BY_EMAIL']
    },

  	'FOLLOWUP':{    // Followups
    	asdpx: 'asx',
    	next: 'COMPLETED',
    	tab:[5],
    	req:["FOLLOWUP_REMARKS"],
    	en:["FOLLOWUP_REMARKS"],
    	stat:[{text:"FOLLOWUP",value:"FOLLOWUP"},{text:"COMPLETED",value:"COMPLETED"}],
    	auto: true,
    	date: '#FOLLOWUP_DATE',
    	email: ['FOLLOWUP_BY_EMAIL']
    },

  	'COMPLETED':{
    	next:'COMPLETED', asdpx:'asxd', tab:[0], req:[],en:[], stat:[{text:"COMPLETED",value:"COMPLETED"}], auto: true,
      statsel : function(rec){ $('#response input.easyui-combobox').combobox('required',false);},
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL','DISPOSITION_BY_EMAIL','REVIEWED_BY_EMAIL','APPROVED_BY_EMAIL','FOLLOWUP_BY_EMAIL']
    },

  	'REJECTED':{
    	next:'REJECTED', asdpx:'asxd', tab:[0], req:[], en:[], stat:[{text:"REJECTED",value:"REJECTED"}], auto: true,
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL','DISPOSITION_BY_EMAIL','REVIEWED_BY_EMAIL','APPROVED_BY_EMAIL','FOLLOWUP_BY_EMAIL']
    }
}