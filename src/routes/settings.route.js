import express from 'express'
import {
    getAllSession, createSession, createLevel, createCenter,
    createFieldOfStudy, createConcourRequirement, getAllActiveSession,
    deleteSession, updateSession, deleteCenter, deleteFieldOfStudy,
    deleteConcourRequirement, deleteLevel, createPermisssion, getActiveRoles,
    deletePermisssion, createRole, getAllRoles, getAllPermission, getActivePermission,
    uploadCenterImage, getAllCenter, updateCenter, getAllPaymentRequestType, createPaymentRequestType, updatePaymentRequestType, deletePaymentRequestType, getAllLevel, getAllConcourRequirement, getAllFieldOfStudy, getAllConcourSubjects, createConcourSubjects, updateConcourSubjects, deleteConcourSubjects, getSessionByDate, getAllCitation, uploadCitationImage, createCitation, deleteCitation, deleteRRImage
} from '../controllers/settings.controller.js';

const router = express.Router()

router.route("/getAllSession").get(getAllSession);
router.route("/getSessionByDate/:dateOfConcour").get(getSessionByDate);
// router.route("/getActiveAllSessions").get(getActiveAllSessions);
router.route("/getAllActiveSession").get(getAllActiveSession);
router.route('/createSession').post(createSession)
router.route('/deleteSession').post(deleteSession)
router.route('/updateSession').post(updateSession)


router.route('/getAllLevel').get(getAllLevel)
router.route('/createLevel').post(createLevel)
router.route('/deleteLevel').post(deleteLevel)

router.route('/getAllCenter').get(getAllCenter)
router.route('/createCenter').post(createCenter)
router.route('/deleteCenter').post(deleteCenter)
router.route('/updateCenter').put(updateCenter)
router.route('/:id/uploadCenterImage').post(uploadCenterImage)

router.route("/getAllRoles").get(getAllRoles);
router.route("/getActiveRoles").get(getActiveRoles);
router.route('/createRole').post(createRole)

router.route("/getAllPermission").get(getAllPermission);
router.route("/getActivePermission").get(getActivePermission);
router.route('/createPermisssion').post(createPermisssion)
router.route('/deletePermisssion').post(deletePermisssion)

router.route('/getAllFieldOfStudy').get(getAllFieldOfStudy)
router.route('/createFieldOfStudy').post(createFieldOfStudy)
router.route('/deleteFieldOfStudy').post(deleteFieldOfStudy)

router.route('/getAllConcourRequirement').get(getAllConcourRequirement)
router.route('/createConcourRequirement').post(createConcourRequirement)
router.route('/deleteConcourRequirement').post(deleteConcourRequirement)

router.route('/getAllConcourSubjects').get(getAllConcourSubjects)
router.route('/createConcourSubjects').post(createConcourSubjects)
router.route('/updateConcourSubjects').put(updateConcourSubjects)
router.route('/deleteConcourSubjects/:name').delete(deleteConcourSubjects)

router.route('/getAllPaymentRequestType').get(getAllPaymentRequestType)
router.route('/createPaymentRequestType').post(createPaymentRequestType)
router.route('/updatePaymentRequestType').put(updatePaymentRequestType)
router.route('/deletePaymentRequestType/:type').delete(deletePaymentRequestType)

router.route('/getAllCitation').get(getAllCitation)
router.route('/createCitation').post(createCitation)
router.route('/uploadCitationImage').put(uploadCitationImage)
router.route('/deleteCitation').post(deleteCitation)
router.route('/deleteRRImage').post(deleteRRImage)

export default router;