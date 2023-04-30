/*
 * Description:Class to update case status and send post request to request catcher end point.
*/
public class postCalloutClass {
    
    //wrapper class to pass all the available case config records related to the case in post request body.
    public class caseConfigWrapper {
       public String Label;
       public String Type;
       public Decimal Amount; 
    }
    
    //method to update case status
    @AuraEnabled(cacheable=false)
    public static void updateCaseStatusandSR(Id caseId){      
       Case casetoUpdate = [Select Id,Status from Case where Id=:caseId];
        if(casetoUpdate.Status!='Closed'){
       casetoUpdate.Status = 'Closed';
        }
        try{ 
       update casetoUpdate;
       System.debug('CaseStatus::'+casetoUpdate.Status);
        }catch(system.Exception e){
           System.debug('error::'+e.getMessage());
        }
    }
    
    //method to POST request to request catcher endpoint.
    @AuraEnabled
    public static void sendPostRequest(Id caseId){
        Case configCase = [Select Id,Status from Case where Id=:caseId];
        //String caseStatus = case.Status;
        List<caseConfigWrapper> ccWrapper = new List<caseConfigWrapper>();
        List<Case_Config__c> caseConfigList = relatedListLWCController.showCaseConfigRecords(caseId);
        for(Case_Config__c cc:caseConfigList){
         caseConfigWrapper ccWrap = new caseConfigWrapper();
            ccWrap.Label = cc.Name;
            ccWrap.type = cc.Type__c;
            ccWrap.Amount = cc.Amount__c;
            ccWrapper.add(ccWrap);
        }
        
        HttpRequest req = new HttpRequest();
        HttpResponse res = new HttpResponse();
        Http http = new Http();
    
        req.setEndpoint('https://ccrequest.requestcatcher.com');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        String body = '"caseId":'+'"'+caseId+'",'+
              ' "status":'+'"'+configCase.Status+'",'+
              '  "caseConfigs":'+'"'+ccWrapper+'",';
        req.setBody(body);
        System.debug('body::'+body);
        req.setCompressed(true); // otherwise we hit a limit of 32000    
        try {
            res = http.send(req);
            if(res.getStatusCode() == 200){
              String resBody = res.getBody();  
            }
            System.debug(res.toString());
            System.debug(res.getBody());
        } catch(System.CalloutException e) {
            System.debug('Callout error: '+ e);
        
        }
    }

}