@isTest
public class postCalloutClassTest {
   @TestSetup
    static void testData() {
       Case cs = new case(Origin= 'Email',Status= 'New',Type= 'Credit/refund');
       insert cs;
        
       List<Case_Config__c> availCaseConfigLst = new List<Case_Config__c>();
        for(Integer i=0;i<10;i++) {
            Case_Config__c cf = new Case_Config__c(Name='TestCF' + i,Type__c='Sample'+i,Amount__c=10.00,Case__c=cs.Id);
            availCaseConfigLst.add(cf);
        }
        insert availCaseConfigLst;
    }
    
    static testMethod void testcaseStatusUpdate() {
        Case cs = [select Id,Status from Case];
        Test.startTest();
        postCalloutClass.updateCaseStatusandSR(cs.Id);
        Case csafterupdate = [select Id,Status from Case];
        System.assertEquals('Closed', csafterupdate.Status);
        Test.stopTest();
    }
    
    public class ExampleCalloutMock implements HttpCalloutMock{
        public HttpResponse respond(HTTPRequest req){
            HttpResponse res = new HttpResponse();
            res.setStatus('OK');
            res.setStatusCode(200);
            res.setBody('Salesforcescool');
            return res;
        }
    }
    
    static testmethod void testsample(){
        Case cs = [select Id,Status from Case];
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExampleCalloutMock());
	    postCalloutClass.sendPostRequest(cs.Id);
        Test.stopTest();
    }

}