$.page.fn.srcdocXX = [
  {type:'wo', value:'srcwo', text: 'Job Order',source:'JOB'},
  {type:'so', value:'srcso', text:'Sales Order',source:'CUST'},
  {type:'po', value:'srcpo', text: 'Purchase Order',source:'VEN'}
];

$.page.fn.srcdoc = [
	{"value":"JOBORDER","source":"JOB","text":"JOB ORDER"},
	{"value":"SALESORDER","source":"CUST","text":"SALES ORDER"},
	{"value":"PURCORDER","source":"VEN","text":"PURCHASE ORDER"}
];

$.page.fn.allstat = {
     
    'GLOBAL':{
  		 page:'ncr',
		 formid:'dqm^comp^ncr_man^NCR_FORM'
  	}, 
  	'MATERIAL_REWORK':{
		data:[{value:'SCRAP',text:'SCRAP'},{value:'REWORK',text:'REWORK'},{value:'REPLACE',text:'REPLACE'},{value:'USE_AS_IS',text:'USE AS IS'},{value:'PRODRECALL',text:'REWORK & RECALL'}]
	},
  	'PENDING': {    // New, My NCRs
    	asdpx: 'asx',
    	next: 'ASSIGNED',
    	tab:[1],
    	req:["SEVERITY","SUBJECT","REPORTED_BY","VERIFIED_BY","REMARKS"],
    	en:["SEVERITY","RECURRENCE","REPORTED_BY","VERIFIED_BY","REMARKS","VERIFIED_REMARKS","WOREF","SUBJECT","SERIAL_NUMBER","ORDER_NO","ORDER_ID","CP_NUMBER","EMPLOYEE_ID","WOREF_INSPECT_QTY","WOREF_REJECT_QTY","srcsel"],
    	stat:[{text:"PENDING",value:"PENDING"},{text:"TO VERIFY",value:"ASSIGNED"}],
    	auto: true,
    	date: '#CREATE_DATE',
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL'],
		reminder:['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
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
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL'],
		reminder:['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
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
    	email: ['DISPOSITION_BY_EMAIL'],
		reminder:['REPORTED_BY_EMAIL','DISPOSITION_BY_EMAIL','REVIEWED_BY_EMAIL']
    },

    'TO_REVIEW':{    // Review
      asdpx: 'asx',
      next: 'REVIEWED',
      tab:[3],
      req:["CAUSE_ID","RA_REMARKS","CA_REMARKS",],
      en:["CAUSE_ID","RA_REMARKS","CA_REMARKS","NCR_STATUS"],
      stat:[{text:"FOR REVIEW",value:"TO_REVIEW"},{text:"TO APPROVE",value:"REVIEWED"},{text:"REJECTED",value:"REJECTED"}],
      auto: true,
      date: '#REVIEWED_DATE',
      email: ['REVIEWED_BY_EMAIL'],
	  reminder:['REPORTED_BY_EMAIL','REVIEWED_BY_EMAIL','APPROVED_BY_EMAIL']
    },

  	'REVIEWED':{    // Approvals
    	asdpx: 'asx',
    	next: 'FOLLOWUP',
    	tab:[3],
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
    	email: ['APPROVED_BY_EMAIL'],
		reminder:['REPORTED_BY_EMAIL','APPROVED_BY_EMAIL','FOLLOWUP_BY_EMAIL']
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
    	email: ['FOLLOWUP_BY_EMAIL'],
		reminder: ['FOLLOWUP_BY_EMAIL']
		
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