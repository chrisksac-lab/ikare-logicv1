import chaiHttp, { request } from "chai-http";
import app from "../index.js";
import * as chai from "chai";

chai.use(chaiHttp);

// describe("/POST authentication", () => {
//     describe("Login user", () => {
//         it("It should login a user", (done) => {
//             const user = {
//                 "auth": "email_and_password",
//                 "email": "chriskameni25@gmail.com",
//                 "password": "12345"
//             }
//             request
//             .execute(app)
//             .post("/api/auth/login")
//             .send(user)
//             .end((err, res) => {
//                 chai.expect(res).to.have.status(200)
//                 chai.expect(res.body.data).to.be.an("object")
//                 done(err);
//             })
//         })
//     })
//     describe("Login user", () => {
//         it("It should not login a user with wrong credentials", (done) => {
//             const user = {
//                 "auth": "email_and_password",
//                 "email": "chriskameni25@gmail.com",
//                 "password": "123456"
//             }
//             request
//             .execute(app)
//             .post("/api/auth/login")
//             .send(user)
//             .end((err, res) => {
//                 chai.expect(res).to.have.status(400)
//                 chai.expect(res.body.message).to.be.a("string")
//                 done(err);
//             })
//         })
//     })
//     describe("Patient registration I", () => {
//         it("It should register a patient", (done) => {
//             const user = {
//                 fullname: "John Doe II",
//                 email: "doe25@gmail.com",
//                 tel: "696952147",
//                 gender: "male",
//                 password: "12345"
//             }
//             request
//             .execute(app)
//             .post("/api/user/register")
//             .send(user)
//             .end((err, res) => {
//                 chai.expect(res).to.have.status(200)
//                 done(err)
//             })
//         })
//     })
//     describe("Patient registration II", () => {
//         it("It should not register existing patient", (done) => {
//             const user = {
//                 fullname: "John Doe",
//                 email: "doe@gmail.com",
//                 tel: "696952147",
//                 gender: "male",
//                 password: "12345"
//             }
//             request
//             .execute(app)
//             .post("/api/user/register")
//             .send(user)
//             .end((err, res) => {
//                 chai.expect(res).to.have.status(400)
//                 done(err)
//             })
//         })
//     })
// });

describe("Appointments endpoint", () => {
    describe("/POST appointment", () => {
        it("BOOK FOR AN APPOINTMENT", (done) => {
            const appt = {
                date: new Date(), 
                details: "Consultation appointment", 
                patient: {email: "gapessie@gmail.com"}, 
                doctor: {email: "madeleine@gmail.com"}, 
                hospital: "General Hospital"
            }
            request
            .execute(app)
            .post("/api/user/book-appointment")
            .send(appt)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body.message).to.be.an("string")
                done(err);
            })
        })
    })
    describe("/GET appointments", () => {
        const user = {
            id: "668cfb51c41743382263c0f0",
            role: "PATIENT"
        }
        it("GET ALL APPOINTMENTS FOR A USER", (done) => {
            request
            .execute(app)
            .post(`/api/user/get-single-user`)
            .send(user)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body.data.appointments).to.be.an("array")
                done(err)
            })
        })
    })
})

describe("Users endpoint", () => {
    describe("/GET all users", () => {
        it("Get all users", (done) => {
            request
            .execute(app)
            .get("/api/user/get-users")
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body.data).to.be.an("array")
                done(err)
            })
        })
    })
    describe("/GET a single user", () => {
        const user = {
            id: "668cfb51c41743382263c0f0",
            role: "PATIENT"
        }
        it("GET SINGLE USER", (done) => {
            request
            .execute(app)
            .post(`/api/user/get-single-user`)
            .send(user)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body.data).to.be.an("object")
                done(err)
            })
        })
    })
})

// describe("Video consultation management", () => {
//     describe("/POST, get video consultation token");
//     describe("/POST start consultation");
//     describe("/POST end consultation");
// })