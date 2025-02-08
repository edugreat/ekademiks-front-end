import { Injectable } from "@angular/core";

@Injectable({
    providedIn:"root"
})
// class that provides links to the server endpoints
export class Endpoints {
 



     //routes to the backend server to fetch test based on the request parameters
 private _baseTestUrl = 'http://localhost:8080/tests/start';
 
  
  

  
    public get baseTestUrl() {
        return this._baseTestUrl;
    }
   
 private _submissionUrl = 'http://localhost:8080/tests/submit';
    public get submissionUrl() {
        return this._submissionUrl;
    }
    

  private _baseSignInUrl = 'http://localhost:8080/auth/sign-in';
    public get baseSignInUrl() {
        return this._baseSignInUrl;
    }
   

  private _refreshTokenUrl = 'http://localhost:8080/auth/refresh-token';
    public get refreshTokenUrl() {
        return this._refreshTokenUrl;
    }
    

    private _baseUrl = 'http://localhost:8080';
    public get baseUrl() {
        return this._baseUrl;
    }
   

    private _setTestUrl = `${this.baseUrl}/admins/test`;



    // HATEOAS LINK
    private _levelUrl = `${this.baseUrl}/learning/levels`;
    public get levelUrl() {
        return this._levelUrl;
    }


    private _notificationUrl = `${this.baseUrl}/admins/notify`;
    public get notificationUrl() {
        return this._notificationUrl;
    }


    // HATEOAS LINK
    private _studenListUrl = `${this.baseUrl}/learning/students`;
    public get studenListUrl() {
        return this._studenListUrl;
    }


    // HATEOAS endpoint that retrieves information about studentTest(e.g the name of assessment the student took for a given assessment id)
    private _studentTestsUrl = `${this.baseUrl}/learning/studentTests`;
    public get studentTestsUrl() {
        return this._studentTestsUrl;
    }




    private _deleteUrl = `${this.baseUrl}/admins/delete`;
    public get deleteUrl() {
        return this._deleteUrl;
    }



    private _deleteAssessmentUrl = `${this.baseUrl}/admins/assessment`;
    public get deleteAssessmentUrl() {
        return this._deleteAssessmentUrl;
    }




    private _assessmentQuestionsBaseUrl = `${this.baseUrl}/learning/tests`;
    public get assessmentQuestionsBaseUrl() {
        return this._assessmentQuestionsBaseUrl;
    }



    private _updateQuestionUrl = `${this.baseUrl}/admins/update/questions`;
    public get updateQuestionUrl() {
        return this._updateQuestionUrl;
    }



    private _deleteQuestionUrl = `${this.baseUrl}/admins/del/question`;
    public get deleteQuestionUrl() {
        return this._deleteQuestionUrl;
    }


    private _updateAssessmentUrl = `${this.baseUrl}/admins/modify/test`;
    public get updateAssessmentUrl() {
        return this._updateAssessmentUrl;
    }



    private _assessmentTopicsUrl = `${this.baseUrl}/admins/topics`;
    public get assessmentTopicsUrl() {
        return this._assessmentTopicsUrl;
    }



    private _editTopicUrl = `${this.baseUrl}/admins/edit/topic`;
    public get editTopicUrl() {
        return this._editTopicUrl;
    }



    private _assessmentDeletionUrl = `${this.baseUrl}/admins/del/topic`;
    public get assessmentDeletionUrl() {
        return this._assessmentDeletionUrl;
    }



    private _assessmentSubjectsUrl = `${this.baseUrl}/admins/subjects`;
    public get assessmentSubjectsUrl() {
        return this._assessmentSubjectsUrl;
    }





    private _updateSubjectNameUrl = `${this.baseUrl}/admins/update/subject_name`;
    public get updateSubjectNameUrl() {
        return this._updateSubjectNameUrl;
    }


    private _deleteSubjectUrl = `${this.baseUrl}/admins/delete/subject`;

    public get deleteSubjectUrl() {
        return this._deleteSubjectUrl;
    }


    private _updateCategoryNameUrl = `${this.baseUrl}/admins/update/category`;
    public get updateCategoryNameUrl() {
        return this._updateCategoryNameUrl;
    }


    private _deleteCategoryUrl = `${this.baseUrl}/admins/delete/category`;

    public get deleteCategoryUrl() {
        return this._deleteCategoryUrl;
    }


    public get setTestUrl() {
        return this._setTestUrl;
    }

    private _newRegistrationUrl = `${this._baseUrl}/admins/register`;

    public get newRegistrationUrl(){

        return this._newRegistrationUrl;
    }

    private _institutionsUrl = `${this.baseUrl}/admins/institutions`;

    public get institutionsUrl(){

        return this._institutionsUrl;
    }


    private _addStudent_Records = `${this.baseUrl}/admins/register_student`;

    public get addStudent_Records(){

        return this._addStudent_Records;
    }


    // CHAT ENDPOINTS
    private chatUrl = 'http://localhost:8080/chats';
    private _createGroupChatUrl = `${this.chatUrl}/group?new=true`;
    
    public get createGroupChatUrl() {
        return this._createGroupChatUrl;
    }

    private _isGroupMemberUrl = `${this.chatUrl}/inGroup`;

    public get isGroupMemberUrl(){

        return this._isGroupMemberUrl;
    }
   
    private _groupInfoUrl  = `${this.chatUrl}/group_info`;

    public get groupInfoUrl() {

        return this._groupInfoUrl;
    }

    private _chatMessagesUrl = `${this.chatUrl}/messages`;

    public get chatMessagesUrl() {
        return this._chatMessagesUrl;
  
    } 

    private _newChatMessageUrl = `${this.chatUrl}/new_chat`;
    public get newChatMessageUrl() {
       
        return this._newChatMessageUrl;
    }

    private _allGroupsUrl = `${this.chatUrl}/groups`;
    public get allGroupsUrl() {
        return this._allGroupsUrl;
    }
   

    private _myGroupIdsUrl = `${this.chatUrl}/ids`;
    public get myGroupIdsUrl() {
        return this._myGroupIdsUrl;
    }

    private _joinRequestUrl = `${this.chatUrl}/join_req`;
    public get joinRequestUrl() {
        return this._joinRequestUrl;
    }
    

    private _approveRequestUrl = `${this.chatUrl}/approve`;
    public get approveRequestUrl(){

        return this._approveRequestUrl;
    }

    private _deleteChatNotificationsUrl  = `${this.chatUrl}/delete`;
    public get deleteChatNotificationsUrl(){

        return this._deleteChatNotificationsUrl
    }
   
    private _pendingGroupChatRequestsUrl = `${this.chatUrl}/pending`;
    public get pendingGroupChatRequestsUrl(){

        return this._pendingGroupChatRequestsUrl;
    }
    

    private _declineJoinRequestUrl = `${this.chatUrl}/decline`;
    public get declineJoinRequestUrl(){

        return this._declineJoinRequestUrl;
    }

    private _editGroupUrl = `${this.chatUrl}/editGroup`;
    public get editGroupUrl(){

        return this._editGroupUrl;
    }
   
   private  _deleteGroupUrl = `${this.chatUrl}/deleteGroup`;


   public get deleteGroupUrl(){

    return this._deleteGroupUrl
   }
  
   private _leaveGroupUrl = `${this.chatUrl}/exit`;

   public get leaveGroupUrl(){

    return this._leaveGroupUrl;
   }

   private _grp_joined_at = `${this.chatUrl}/grp_joined_at`;

   public get grp_joined_at(){

    return this._grp_joined_at;
   }

   private _anyRecentPosts = `${this.chatUrl}/recent/post`;

   public get anyRecentPosts(){

    return this._anyRecentPosts;
   }
  

   private  _editChatUrl = `${this.chatUrl}/modify/msg`;

   public get editChatUrl(){

    return this._editChatUrl;
   }

   private _deleteChatUrl = `${this.chatUrl}/del_msg`;

   public get deleteChatUrl(){

    return this._deleteChatUrl;
   }

   private _disconnectUrl = `${this.baseUrl}/auth/disconnect`;

   public get disconnectUrl(){

    return this._disconnectUrl;
   }
 
   // ASSIGNMENT ENDPOINTS
   private _assignmentUrl = `${this.baseUrl}/assignments`;

   public get assignment(){

    return this._assignmentUrl;
   }

   private _pdfAssignmentUrl = `${this._assignmentUrl}/file`;

   public get pdfAssignmentUrl(){

    return this._pdfAssignmentUrl;
   }

}


