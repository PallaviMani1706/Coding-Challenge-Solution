import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import {loadStyle} from 'lightning/platformResourceLoader';
import relatedListResource from '@salesforce/resourceUrl/relatedListResource';
import fetchAvailableConfigRecord from '@salesforce/apex/relatedListLWCController.fetchAvailableConfigRecord';
import createCaseConfigRecords from '@salesforce/apex/relatedListLWCController.createCaseConfigRecords';
import showCaseConfigRecords from '@salesforce/apex/relatedListLWCController.showCaseConfigRecords';
import sendPostRequest from '@salesforce/apex/postCalloutClass.sendPostRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import CASE_STATUS from '@salesforce/schema/Case.Status';
const fields = [CASE_STATUS];
import { refreshApex } from '@salesforce/apex';

export default class RelatedListLWC extends NavigationMixin(LightningElement) {
    @api recordId;
    configRecords;
    caseConfigRecords;
    configRelatedRecords;
    caseConfigrelatedRecords;
    selectedConfigRows;
    existingCaseConfigsNames;
    configsToAddLst;
    errors;
    disableAddbutton=false;
    caseConfigExists;

    @api columns = [
        { label: 'Label', fieldName: 'Name', type:'text', hideDefaultActions: 'true',fixedWidth:'100px', cellAttributes: { alignment: 'left' }},
        { label: 'Type', fieldName: 'Type__c',type:'text', hideDefaultActions: 'true' ,fixedWidth:'100px', cellAttributes: { alignment: 'left' }},
        { label: 'Amount', fieldName: 'Amount__c', type:'number', hideDefaultActions: 'true',fixedWidth:'100px', cellAttributes: { alignment: 'left' }}        
    ];

    renderedCallback() {
        loadStyle(this, relatedListResource + '/relatedList.css')
    }
    
    @wire(getRecord, { recordId: '$recordId', fields })
    case;

    @wire (fetchAvailableConfigRecord) 
    wireConfigRecords(result) {
        this.configRecords = result;
        this.fetchConfigRecords(this.configRecords);
        console.log('Case recordId::',this.recordId);
    }

    fetchConfigRecords(result) {
       if(result.data){
          let data = result.data;
          let parseData = [];
          data.forEach(configRecs => {

           let dataFormat = {
             'Id': configRecs.Id,
             'Name': configRecs.Name,
             'Type__c': configRecs.Type__c,
             'Amount__c': configRecs.Amount__c

           };
           parseData.push(dataFormat);
          })
          this.configRelatedRecords = parseData;
       }
       else if(result.error){
        this.errors = result.error;
       }
    }

    handleNavigationToConfig() {
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
    
    get status() {
        return getFieldValue(this.case.data, CASE_STATUS);
    }

    getSelectedIdAction(event){
        this.selectedConfigRows = this.template.querySelector("lightning-datatable").getSelectedRows();
        window.console.log('selectedConfigRows# ' + JSON.stringify(this.selectedConfigRows));
        console.log('Cs::',this.status);
        if(this.status!='Closed'){
        this.getCaseConfigExists();
        }else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'error',
                    message: 'You can not add configs as the case status is closed',
                    variant: 'error',
                }),
            );  
        }
    }
 
    getCaseConfigExists(){
        console.log('selectedConfigRowsinGCCE::',this.selectedConfigRows);
        
        showCaseConfigRecords({ caseId: this.recordId })
        .then((result) => {
            console.log('resultInGCCE::',result);
            if(result.length>0){
                let caseConfigsAlreadyExists=[];
                result.forEach(caseConfigRecs => {
                    console.log('inside 1 loop');
                    this.selectedConfigRows.forEach(configSelected => {
                        console.log('inside 2 loop');
                     if(caseConfigRecs.Name == configSelected.Name){
                        caseConfigsAlreadyExists.push(caseConfigRecs.Name);
                     }else{
                        caseConfigsAlreadyExists.push();
                     }
                  }) 
                }) 
                this.existingCaseConfigsNames = caseConfigsAlreadyExists;
                console.log('existingCaseConfigsNames::',this.existingCaseConfigsNames.length);
            }
            if(this.existingCaseConfigsNames.length>0){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'error',
                        message: this.existingCaseConfigsNames+' Config records is already added to the case.please unselet it and try!!',
                        variant: 'error',
                    }),
                );
            }
            else{
                if(this.selectedConfigRows.length!=0){
                    createCaseConfigRecords({ CaseId: this.recordId, configRecords: this.selectedConfigRows })
                    .then((result) => {
                    console.log('Success');
                    this.template.querySelector('lightning-datatable').selectedRows=[];
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Added Config records to case',
                            variant: 'Success',
                        }),
                    ); 
                    this.template.querySelector('c-case-config-related-list-l-w-c').childMethod();
                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error Adding config records to case',
                                message: error.body.message,
                                variant: 'error',
                            }),
                        );
                    })
                }else{
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'error',
                            message: 'Please select some record to Associate with the case',
                            variant: 'Success',
                        }),
                    ); 
                }
            }
        })
    }
   
}