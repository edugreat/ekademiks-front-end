export const ADMIN_ROUTE_CONSTANTS = {


    BASE:'admin',

    // upload routes
    UPLOAD:{

        SUBJECT:'u/subject',
        CATEGORY:'u/category',
        TEST:'u/test',
    },

    // fetch routes
    FETCH:{
        TEST:'f/test',
        SUBJECT:'f/subject',
        CATEGORY:'f/category',
        TOPIC:'f/topic',
        STUDENTS:'students-list',
        TEST_INFO:(id:string) => `f/test/${id}`,
        ASSESSMENT_QUESTIONS:(id:string, topic:string, testId:string) => `f/test/${id}/${topic}/${testId}`,
        STUDENT_DETAILS:(id:string)=> `f/students-list/${id}`,
    },
    REGISTER:'register',
    ASSIGNMENT:'assignment',
    ADD_STUDENT:(adminId:string) => `add_student/${adminId}`,

}