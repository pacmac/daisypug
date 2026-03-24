$.page.fn.srcdocXX = [
  {type:'wo', value:'srcwo',text: 'Job Order',source:'JOB'},
  {type:'so', value:'srcso',text:'Sales Order',source:'CUST'},
  {type:'po', value:'srcpo',text: 'Purchase Order',source:'VEN'},
  {type:'ncr', value:'srcncr',text: 'NCR',source:'NCR'},
  {type:'cust', value:'srccust',text: 'Customer Complaint',source:'CUST'},
  {type:'audit', value:'srcaudit',text: 'Audit',source:'NONE'},
  {type:'ci', value:'srcci',text: 'Cust Improvement',source:'CUST'},
  {type:'EXTERNAL REJECT', value:'srccust',text: 'EXTERNAL REJECT',source:'CUST'},
  {type:'EXTERNAL REJECT WARRANTEE CLAIM', value:'srccust',text:'EXTERNAL REJECT WARRANTEE CLAIM',source:'CUST'},
];


$.page.fn.srcdoc=[
	{"value":"JOBORDER","source":"JOB","text":"JOB ORDER"},
	{"value":"SALESORDER","source":"CUST","text":"SALES ORDER"},
	{"value":"PURCORDER","source":"VEN","text":"PURCHASE ORDER"},
	{"value":"NCR","source":"NCR","text":"NCR DOCUMENT"},
	{"value":"CUSTCOMPLAINT","source":"CUST","text":"CUSTOMER COMPLAINT"},
	{"value":"AUDIT","source":"NONE","text":"AUDIT"},
	{"value":"OBSERVATION","source":"CUST","text":"CI / OBSERVATION"},
	{"value":"EXTERNAL REJECT","source":"CUST","text":"EXTERNAL REJECT"},
	{"value":"EXTERNAL REJECT WARRANTEE CLAIM","source":"CUST","text":"EXTERNAL REJECT WARRANTEE CLAIM"},
	{"value":"INTERNAL AUDIT","source":"NONE","text":"INTERNAL AUDIT"}
];

$.page.fn.allstat = {
       
    'GLOBAL':{
  		  page:'cpar',
  		  formid:'dqm^comp^cpar_man^CPAR'
  	},
  	'MATERIAL_REWORK':{
		data:[{value:'KIV',text:'Keep in View'},{value:'NAR',text:'No action required'},{value:'MONITOR',text:'Monitor for more occurrences'},{value:'ACTION',text:'Action'},{value:'IMACTION',text:'Action immediately'},{value:'PRODRECALL',text:'Action Immediate and Product Recall'}]
	},
  	'PENDING': {    // New, My NCRs
    	next: 'ASSIGNED',
    	tab:[1],
    	req:["SUBJECT","REPORTED_BY","VERIFIED_BY","REMARKS"],
    	en:["REPORTED_BY","VERIFIED_BY","REMARKS","WOREF","SUBJECT","SERIAL_NUMBER","ORDER_NO","ORDER_ID","CP_NUMBER","EMPLOYEE_ID","WOREF_INSPECT_QTY","WOREF_REJECT_QTY","srcsel"],
    	stat:[{text:"PENDING",value:"PENDING"},{text:"TO VERIFY",value:"ASSIGNED"}],
    	date: '#CREATE_DATE',
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
    },

  	'ASSIGNED':{    // Verify
    	next: 'VERIFIED',
    	tab:[1],
    	req:["DISPOSITION_BY","REVIEWED_BY","APPROVED_BY"],
    	en:["NCR_STATUS","REVIEWED_BY","APPROVED_BY","DISPOSITION_BY","REMARKS","VERIFIED_REMARKS"],
    	stat: [{text:"TO VERIFY",value:"ASSIGNED"},{text:"VERIFIED",value:"VERIFIED"},{text:"REJECTED",value:"REJECTED"}],
    	date: '#VERIFIED_DATE',
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL']
    },

  	'VERIFIED':{    //  Disposition
    	next: 'TO_REVIEW',
    	tab:[2],
    	req:["DISPOSITION_REMARKS","DISPOSITION_MATERIAL"],
    	en:["DISPOSITION_REMARKS","DISPOSITION_MATERIAL","DISPOSITION_DOC_NO","REMARKS","VERIFIED_REMARKS"],
        stat: [{text:"FOR DISPOSITION",value:"VERIFIED"},{text:"FOR REVIEW",value:"TO_REVIEW"}],
    	date: '#DISPOSITION_DATE',
    	email: ['DISPOSITION_BY_EMAIL']
    },

    'TO_REVIEW':{    // Review
      next: 'REVIEWED',
      tab:[3],
      req:["CAUSE_ID","RA_REMARKS","CA_REMARKS",],
      en:["CAUSE_ID","RA_REMARKS","CA_REMARKS","NCR_STATUS"],
      stat:[{text:"TO APPROVE",value:"REVIEWED"},{text:"REJECTED",value:"REJECTED"},{text:"FOR REVIEW",value:"TO_REVIEW"}],
      date: '#REVIEWED_DATE',
      email: ['REVIEWED_BY_EMAIL']
    },

  	'REVIEWED':{    // Approvals
    	next: 'FOLLOWUP',
    	tab:[3],
    	req:["SEVERITY","RECURRENCE","CAUSE_ID","RA_REMARKS","CA_REMARKS",],
    	en:["SEVERITY","RECURRENCE","CAUSE_ID","RA_REMARKS","CA_REMARKS","NCR_STATUS"],
    	stat:[{text:"AWAITING APPROVAL",value:"REVIEWED"},{text:"FOLLOWUP",value:"FOLLOWUP"},{text:"COMPLETED",value:"COMPLETED"},{text:"REJECTED",value:"REJECTED"}],
    	statsel : function(rec){
        var ro=true; if(rec.value=='FOLLOWUP') var ro=false;
        $('#FOLLOWUP_BY').combobox('readonly',ro);
        $('#FOLLOWUP_BY').combobox('required',!ro);
        $('#CLOSED_OUT_BY').combobox('readonly',ro);
        $('#CLOSED_OUT_BY').combobox('required',!ro);
    	},
    	email: ['APPROVED_BY_EMAIL']
    },

  	'FOLLOWUP':{    // Followups
    	next: 'COMPLETED',
    	tab:[5],
    	req:["FOLLOWUP_REMARKS"],
    	en:["FOLLOWUP_REMARKS"],
    	stat:[{text:"FOR FOLLOWUP",value:"FOLLOWUP"},{text:"COMPLETED",value:"COMPLETED"}],
    	date: '#FOLLOWUP_DATE',
    	email: ['FOLLOWUP_BY_EMAIL']
    },
	  
    'COMPLETED':{    //Completed
    	next: 'TOCLOSEOUT',
    	tab:[6],
      en:["NCR_STATUS"],
      req:[],
    	statxx:[{text:"AWAITING CLOSEOUT",value:"COMPLETED"},{text:"FOLLOWUP",value:"FOLLOWUP"}],
		stat:[{text:"COMPLETED",value:"COMPLETED"},{text:"AWAITING CLOSEOUT",value:"TOCLOSEOUT"}],
		
    },
	  
    'TOCLOSEOUT':{    
    	next: 'CLOSED',
    	tab:[6],
		  req:["CLOSE_OUT_REMARKS"],
    	en:["CLOSE_OUT_REMARKS"],
    	stat:[{text:"AWAITING CLOSEOUT",value:"TOCLOSEOUT"},{text:"CLOSED",value:"CLOSED"},{text:"AWAITING CLOSEOUT",value:"COMPLETED"}],
		date:'#CLOSED_OUT_DATE',
      email: ['CLOSED_OUT_BY_EMAIL']
    },
	  
    'CLOSED':{    
    	next: 'CLOSED',
    	req:[],
    	en:[],
    	tab:[0],
    	stat:[{text:"CLOSED",value:"CLOSED"}]
    },	
  	
  	'REJECTED':{
    	next:'REJECTED', asdpx:'asxd', tab:[0], req:[], en:[], stat:[{text:"REJECTED",value:"REJECTED"}],
    	email: ['REPORTED_BY_EMAIL','VERIFIED_BY_EMAIL','DISPOSITION_BY_EMAIL','REVIEWED_BY_EMAIL','APPROVED_BY_EMAIL','FOLLOWUP_BY_EMAIL']
    }
}