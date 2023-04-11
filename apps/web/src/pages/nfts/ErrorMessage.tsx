import { Alert, Text } from "@pancakeswap/uikit";
import React, { useState, useEffect } from "react";

const ErrorMessage = (props) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            props.setErrorText('');
        }, 6000);

        return () => {
            clearTimeout(timer);
        };
    }, [props.errorMessage]);

    return (
        <>
            <Alert title="Danger" variant="danger">
            <Text as="p">{props.errorMessage}</Text>
            </Alert>
        </>
    );
};

export default ErrorMessage;