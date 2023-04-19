import React from "react";
import { Message, MessageText, Button } from '@pancakeswap/uikit'

const StepFour = (props) => {
   const { isLoading, isRejected, setGoSteps, setIsRejected } = props
   return (
      <>
        <style jsx global>
          {`
            .step-four-item {
                display: flex;
                flex-direction: column;
                height: 100%
            }
            .step-four-item .content {
               display: flex;
               justify-content: center;
               margin: 0 10px;
            }
            .step-four-item .footer {
                display: flex;
                justify-content: flex-end;
                margin-top: auto;
            }
            .text-label {
               margin-bottom: 5px
            }
          `}
        </style>
      <section className='step-four-item'>
        <div className="row content">
         {
            isLoading && (
            <Message variant="warning">
               <MessageText>
               loading
               </MessageText>
            </Message>
         )
         }
         {
            isRejected && (
               <Message variant="danger">
                  <MessageText>
                  User Denied Transaction
                  </MessageText>
               </Message>
            )
         }
         {
            !isLoading && !isRejected && (
               <Message variant="success">
                  <MessageText>
                  The pool is created successfully.
                  </MessageText>
               </Message>
            )
         }
         </div>

         <div className="footer">
            <Button mr="8px" type="button" variant="light" onClick={() => {
                  setGoSteps(2)
                  setIsRejected(false)
               }}>Prev</Button>
           {/* <Button type="button" variant="success" onClick={() => setGoSteps(4)}>Submit</Button> */}
         </div>
      </section>
      </>
   );
};

export default StepFour;
