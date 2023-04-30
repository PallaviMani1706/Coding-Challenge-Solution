@isTest
public class relatedListLWCControllerTest {
    @TestSetup
    static void testData() {
       Case cs = new case(Origin= 'Email',Status= 'New',Type= 'Credit/refund');
       insert cs;
        
       List<Config__c> availConfigLst = new List<Config__c>();
        for(Integer i=0;i<10;i++) {
            Config__c cf = new Config__c(Name='TestCF' + i,Type__c='Sample'+i,Amount__c=10.00);
            availConfigLst.add(cf);
        }
        insert availConfigLst;
    }
    
    static testMethod void testcreateCCRecords() {
        Case cs = [select id,Status from Case where Status='New'];
        List<Config__c> availableCFL = [select id,Name,Type__c,Amount__c from Config__c];
        Test.startTest();
        relatedListLWCController.fetchAvailableConfigRecord();
        relatedListLWCController.createCaseConfigRecords(cs.Id,availableCFL);
        List<Case_Config__c> caseConfigCreated=relatedListLWCController.showCaseConfigRecords(cs.Id);
        System.assertEquals(10, caseConfigCreated.size());
        Test.stopTest();
    }
    
}