**Aprroach for Splitting tasks**

**1.Identifying Base of the Requirement**
As per the requirement I understood that Object Creation, Data Uniqueness and showing up non related object in related list is the first step.so,
  a. created Config and Case Config objects.
  b. added validation rule to the Name field on both the objects to make the field value unique.
  c. Identified the approach to show non related object i.e., Config records in the related list as an LWC component.
  d. created LWC component and included in the case related list page.

**2.Finding next primary part of the Requirement**
the next primary part of the requirement is adding 'Add' button to the related list and creating Case Config records, showing those newly added case config records in the related list.
   a. included 'Add' button in the config LWC component and by calling apex method in the button action function achieved the record creation.
   b. created one more LWC component for Case Config record as i need to include one custom button in it as part of further requirment.
   c. called this case config LWC component in Config LWC component.
   d. used LWC query feature to query the child component and refresh it on adding new case config record without clicking the refresh button in the browser.

**3.Adding Send Button with callout feature**
the finally part of the requirement was on click of 'Send' button setting the case status to closed and posting the request to request cacher end point.
   a. added 'Send' button in Case config LWC component and called apex methods in onclick funtion for this button.
   b. created an apex class that contains 2 methods, one to update case status and one to perform callout.
   c. used wrapper class to construct the POST body and used try catch bloc to handle the status code errors.

**4.Performing Unit Tests**
to check the code functionality and performance created test classes and assured the coverage above 90%.

**Functionalities Covered:**
1. Displays all Config records and Case Config records in a 3-column list: Label, Type and Amount.
2. User can select multiple records and after pressing the “Add” button they will be
added to the Case Configs list (also new Case Config records are saved to the
database).
3. If a Config record has already been added to the Case Configs list it cannot be
added a second time.
4. When a user adds new Config records, new records appear in this list without
having to refresh the page.
5. Sets the status of the Case to “Closed” when send button is pressed.
6. When the send button is pressed, a request is sent to the external service.
7. The request format should follow the following JSON structure:
{
"caseId": "50068000005QOhbAAG",
"status": "Closed",
"caseConfigs": [{
"label": "Test Label",
"type": "Test Type",
"amount": 10.00 }]
}
8. When the “Send” button is pressed you cannot add new Config records and send
the request a second time.
9. Request is sent as POST.
10. Errors of the external system need to be handled:
11. All 200 responses are considered as OK and Any non-200 response is handled as ERROR
12. A test coverage of at least 85% for APEX is required.
13. View all link on related list which will take to list view of that object on click.



