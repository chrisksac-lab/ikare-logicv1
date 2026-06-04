import PaymentSchema from "../models/payment.model.js";
import * as hospitalService from "../services/hospital.service.js";
import dotenv from 'dotenv-flow';
dotenv.config({ path: 'local.env' });
import axios from "axios"

const verifyPayment = async (reference) => {
  const url = 'https://www.campay.net/api/collect/'
  const permanent_token = "0675a6a0848213fb0dc2ea6ac15a042e8d285d75";

  const initializePaymentResponse = await axios.post(url, 
       {
          amount: 10,
          currency: "XAF",
          description: details,
          from: "237"+tel_fee,
          "external_reference": "",
          "external_user": ""
        },
        {
          headers: {
            Authorization: `Token ${permanent_token}`, 
            'Content-Type': 'application/json'
          }
        }
      );
   const verify_transaction_url =`https://www.campay.net/api/transaction/${initializePaymentResponse.data?.reference}` 
   var verify_transaction_response = await axios.get(verify_transaction_url,
    {
      headers: {
        Authorization: `Token ${permanent_token}`, 
        'Content-Type': 'application/json'
      }
    });
    console.log("First VERIFICATION DONE ", verify_transaction_response);
    while (verify_transaction_response.data?.status == "PENDING") {
      verify_transaction_response = await axios.get(verify_transaction_url,
        {
          headers: {
            Authorization: `Token ${permanent_token}`, 
            'Content-Type': 'application/json'
          }
        });
    }
  console.log("Last VERIFICATION DONE ", verify_transaction_response);

}

export const initiatePayment = async (req, res) => {
    try {
        const {_id, tel_fee, details, amount, doctor} = req.body;
        const allHospitals = await hospitalService.getAllHospitals();
        var institute;
        const django_payment_url = "http://127.0.0.1:8005/api/payment/";
        const payment_response = await axios.post(django_payment_url, {
            "amount": "10",
            "tel": tel_fee,
            "description": "Consultation fee"
        })
        const collect_data = payment_response.data?.collect

        if (collect_data?.status == "FAILED") {
            return res.status(400).json({message: "An error occured while trying to process the payment, please try again !"})
        }

        for (let hospital of allHospitals) {
            const doctorObj = hospital.doctors.find(doc => doc.email == doctor);
            if(doctorObj)
            {
                institute = hospital;
                break
            }
        }
        const created = await PaymentSchema.create({
            user: _id,
            tel: tel_fee,
            details,
            amount,
            institute: institute._id,
            doctor,
            status: collect_data?.status,
            reference: collect_data?.reference
        })
        return res.status(200).json({message: "Payment successful !"});
    } catch(error) {
        console.log("ERROR ", error);
        res.status(500).json({message: error.message});
    }
}
