import React, { useState } from "react";
import { Button } from '@pancakeswap/uikit'

const StepTwo = ({
   setGoSteps,
   defaultAccount,
   ownerValue,
   onSubmit
}) => {

   const [owner, setOwner] = useState(ownerValue)

   const datas = [
      {
         title: "Owner",
         placeHolder: "The owner of the staking contract",
         type: 'text',
         function: (e) => setOwner(e.target.value),
         value: owner,
      },
   ]

   return (
      <>
        <style jsx global>
          {`
            .step-two-item {
                display: flex;
                flex-direction: column;
                height: 100%
            }
            .step-two-item .content {
               display: flex;
               justify-content: center;
            }
            .step-two-item .footer {
                display: flex;
                justify-content: flex-end;
                margin-top: auto;
            }
            .text-label {
               margin-bottom: 5px
            }
          `}
        </style>
      <section className='step-two-item'>
         <div className="row content">
            {
               datas.map((data, index) => {
                  return (
                     <div
                        key={index}
                        className="col-lg-6 mb-2"
                     >
                        <div className="form-group mb-3">
                           <label className="text-label">{data.title}</label>
                           <input
                              type={data.type}
                              className="form-control"
                              placeholder={data.placeHolder}
                              required
                              autoComplete="off"
                              onChange={data.function}
                              defaultValue={data.value}
                              id={index}
                           />
                           {
                              index === 0 && (
                                 <Button mt="20px" id="Wallet" type="button" variant="success" onClick={() => setOwner(defaultAccount)}>Use Linking Wallet</Button>
                              )
                           }
                        </div>
                     </div>
                  )
               })
            }
         </div>
         <div className='footer'>
           <Button mr="8px" type="button" variant="light"  onClick={() => {
               setGoSteps(0)
               onSubmit(owner)
            }}>Prev</Button>
           <Button type="button" variant="success" onClick={() => {
               setGoSteps(2)
               onSubmit(owner)
            }}>Next</Button>
         </div>
      </section>
      </>
   );
};

export default StepTwo;
