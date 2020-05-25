'use strict';

module.exports = function () {
    let self = this;

    /////////////////////////////////////////////////
    //
    // Shared Function
    //
    /////////////////////////////////////////////////

    //Find exist and not exist general applications for specific general user
    self.findExistNotExistApplications = function (generalAppIDs, applications, generalUserAppHeader, GENERAL_USER_APP_ID, GENERAL_USER_APP_NAME, ERROR_MESSAGE) {
        //Sort general application id array at first, then existArray and notExistArray will be sorted
        if (generalAppIDs && generalAppIDs.length !== 0) {
            generalAppIDs.sort((a, b) => a - b);
        }
        let existArray = [];
        let notExistArray = [];
        let result = [];
        for (let index in generalAppIDs) {
            let generalAppID = generalAppIDs[index];
            let application = applications.find(element => element.generalUserApplicationID === generalAppID);
            //1.If we find the application according to generalAppID, we store it in the existArray
            //2.If we don't find the application according to generalAppID, we create a not exist application object
            //  And store it in the notExistArray
            if (application) {
                existArray.push(application);
            }
            else {
                let notExistApplication = createNotExistApplicationObj(generalAppID, generalUserAppHeader, GENERAL_USER_APP_ID, GENERAL_USER_APP_NAME, ERROR_MESSAGE);
                notExistArray.push(notExistApplication);
            }
        }
        result = result.concat(existArray);
        result = result.concat(notExistArray);
        return result;
    };

    //Find assigned and not assigned general applications for specific general user
    self.findAssignNotAssignApplications = function (generalAppIDs, applications) {
        //Sort general application id array at first, then assignedApps will be sorted
        if (generalAppIDs && generalAppIDs.length !== 0) {
            generalAppIDs.sort((a, b) => a - b);
        }
        let assignedApps = [];
        let unassignedApps = applications;
        let result = {};
        for (let index in generalAppIDs) {
            let generalAppID = generalAppIDs[index];
            let application = applications.find(element => element.generalUserApplicationID === generalAppID);
            if (application) {
                assignedApps.push(application);
                unassignedApps = unassignedApps.filter(element => element !== application);
            }
        }
        result.assignedApps = assignedApps;
        result.unassignedApps = unassignedApps;
        return result;
    };

    //Find current unassigned general user applications according to current general user assigned applications
    self.findCurrUnassignApps = function (totalAppsResult, currentAassignApps) {
        for (let index in currentAassignApps) {
            let currentAassignApp = currentAassignApps[index];
            let position = totalAppsResult.findIndex((element) => element.generalUserApplicationID === currentAassignApp.generalUserApplicationID);
            if (position !== undefined && position !== null) {
                totalAppsResult.splice(position, 1);
            }
        }
        return totalAppsResult;
    };

    self.extractGeneralAppIDs = function (assignApps) {
        let generalAppIDs = [];
        for (let index in assignApps) {
            let assignApp = assignApps[index];
            generalAppIDs.push(assignApp.generalUserApplicationID);
        }
        return generalAppIDs;
    };

    //Sort general applications array according to generalUserApplicationID
    self.sortGeneralApplications = function (applications) {
        if (applications && applications.length !== 0) {
            applications = applications.sort((a, b) => a.generalUserApplicationID - b.generalUserApplicationID);
        }
        return applications;
    };

    ///////////////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////////////

    //Create a not exist application object according to dashboard config file GeneralUser.generalUserAppHeader
    function createNotExistApplicationObj(generalAppID, generalUserAppHeader, GENERAL_USER_APP_ID, GENERAL_USER_APP_NAME, ERROR_MESSAGE) {
        let object = {};
        for (let key in generalUserAppHeader) {
            let value = generalUserAppHeader[key];
            if (value === GENERAL_USER_APP_ID) {
                object[value] = generalAppID;
            }
            else if (value === GENERAL_USER_APP_NAME) {
                object[value] = ERROR_MESSAGE;
            }
            else {
                object[value] = null;
            }
        }
        return object;
    }
};