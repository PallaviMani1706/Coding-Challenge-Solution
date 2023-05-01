import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import {loadStyle} from 'lightning/platformResourceLoader';
import relatedListResource from '@salesforce/resourceUrl/relatedListResource';
import showCaseConfigRecords from '@salesforce/apex/relatedListLWCController.showCaseConfigRecords';
import updateCaseStatusandSR from '@salesforce/apex/postCalloutClass.updateCaseStatusandSR';
import sendPostRequest from '@salesforce/apex/postCalloutClass.sendPostRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import CASE_STATUS from "@salesforce/schema/Case.Status";
import { refreshApex } from '@salesforce/apex';

const fields = [CASE_STATUS];
export default class caseConfigRelatedListLWC extends NavigationMixin(LightningElement) {
    @api recordId;
    configRecords;
    caseConfigRecords;
    configRelatedRecords;
    caseConfigrelatedRecords;
    errors;
    disableSendButton=false;

    @api columns = [
        { label: 'Label', 
          fieldName: 'Name', 
          type:'text', 
          hideDefaultActions: 'true',
          fixedWidth:'100px', 
          cellAttributes: { alignment: 'left' }},
        { label: 'Type', 
          fieldName: 'Type__c',
          type:'text', 
          hideDefaultActions: 'true' ,
          fixedWidth:'100px', 
          cellAttributes: { alignment: 'left' }},
        { label: 'Amount', 
          fieldName: 'Amount__c', 
          type:'number', 
          hideDefaultActions: 'true',
          fixedWidth:'100px', 
          cellAttributes: { alignment: 'left' }}        
    ];
    
    renderedCallback() {
        loadStyle(this, relatedListResource + '/relatedList.css')
        if(this.status == 'Closed'){
            this.disableSendButton = true;
        }else{
            this.disableSendButton = false;
        }
    }

    @wire(getRecord, {recordId: "$recordId", fields })
    caseStatus;

    get status() {
        return getFieldValue(this.caseStatus.data, CASE_STATUS);
    }

    @wire (showCaseConfigRecords, { caseId: '$recordId' }) 
    wiredCaseConfigRecords(result) {
        this.caseConfigRecords = result;
        this.showCaseConfigRecords(this.caseConfigRecords);
    }

    showCaseConfigRecords(result){
        if(result.data){
            let data = result.data;
            let parseData = [];
            data.forEach(caseConfigRecs => {
  
             let dataFormat = {
               'Id': caseConfigRecs.Id,
               'Name': caseConfigRecs.Name,
               'Type__c': caseConfigRecs.Type__c,
               'Amount__c': caseConfigRecs.Amount__c
  
             };
             parseData.push(dataFormat);
            })
            this.caseConfigrelatedRecords = parseData;
         }
         else if(result.error){
          this.errors = result.error;
         } 
    }
    
    @api
    childMethod() {
     if(this.caseConfigRecords){
        refreshApex(this.caseConfigRecords);
     }
    }

    handleViewAll() {
        this[NavigationMixin.Navigate]({
            type: "standard__objectPage",
            attributes: {
                    actionName: 'list',
                    objectApiName: "Config__c"
            },
            state: {
                    filterName: 'All'
            },
        });
    }

    updateCaseStatusandSR(event){
      updateCaseStatusandSR({caseId: this.recordId })
      .then((result) => {
        sendPostRequest({caseId: this.recordId })
        .then((result) => {           
        this.disableSendButton = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Request success',
                    variant: 'Success',
                }),
              );
            eval("$A.get('e.force:refreshView').fire();"); 
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating Case Status to Closed',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        })
      })
      .catch(error => {
          this.dispatchEvent(
              new ShowToastEvent({
                  title: 'Error updating Case Status to Closed',
                  message: error.body.message,
                  variant: 'error',
              }),
          );
      })

    }

}