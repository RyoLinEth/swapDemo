import React from "react";
import { Link } from "react-router-dom";
import { Button } from '@pancakeswap/uikit'

const StepFour = (props) => {
   const { isLoading, isRejected, setGoSteps, setIsRejected } = props
   return (
      <section>
         {
            isLoading && <>Loading</>
         }
         {
            isRejected && <>User Denied Transaction</>
         }

         <div className="text-end toolbar toolbar-bottom p-2">
            <Button mr="8px" type="button" variant="light" onClick={() => {
                  setGoSteps(2)
                  setIsRejected(false)
               }}>Prev</Button>
           <Button type="button" variant="success" onClick={() => setGoSteps(4)}>Submit</Button>
         </div>
      </section>
   );
};

export default StepFour;
