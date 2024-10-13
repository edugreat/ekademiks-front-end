
// class that provides links to the server endpoints
export class Endpoints {




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
}