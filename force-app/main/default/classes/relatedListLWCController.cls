/*
 * Description:Controller class for relatedListLWCController and caseConfigRelatedListLWCController.
*/
public with sharing class relatedListLWCController {

    //method to return all available config records to LWC inorder to show it in the relatedlist table
    @AuraEnabled(cacheable=true)
    public static List<Config__c> fetchAvailableConfigRecord(){
        List<Config__c> configList = [Select Id, Name, Type__c, Amount__c From Config__c];
        system.debug('configList::'+configList);
        return configList;
    }
    
    //method to create caseConfig records for the selected config records in the related list
    @AuraEnabled(cacheable=false)
    public static void createCaseConfigRecords(Id CaseId, List<Config__c> configRecords){
       List<Case_Config__c> caseConfigToAdd = new List<Case_Config__c>();
       System.debug('CaseId::'+CaseId);
       System.debug('configRecords::'+configRecords);
        for(Config__c config:configRecords){
          Case_Config__c caseConfig = new Case_Config__c();
           caseConfig.Case__c = CaseId;
           caseConfig.Name = config.Name;
           caseConfig.Type__c = config.Type__c;
           caseConfig.Amount__c = config.Amount__c;
          caseConfigToAdd.add(caseConfig);
        }
        Database.SaveResult[] results = Database.insert(caseConfigToAdd, false);

        for (Database.SaveResult result : results) {
            if (result.isSuccess()) {
                System.debug('CaseConfig Successfully inserted, caseConfig Id is: ' + result.getId());
            }
            else {              
                for(Database.Error error : result.getErrors()) {
                     System.debug(error.getStatusCode() + ': ' + error.getMessage() + 
                                  ' Fields that affected the error: ' + error.getFields());
                }
            }
        }
    }
    
    //method to return caseConfig records to LWC inorder to show the case config records in the related list
    @AuraEnabled(cacheable=true)
    public static List<Case_Config__c> showCaseConfigRecords(Id caseId){
     List<Case_Config__c> caseConfigList = [Select Id, Name, Type__c, Amount__c,Case__c From Case_Config__c where Case__c=:caseId];
        system.debug('caseConfigList::'+caseConfigList);
        return caseConfigList; 
    }
}