const TransactionCallBack = (provider, result) => {
    return new Promise((resolve, reject) => {
        provider
            .getTransaction(result.hash)
            .then(async (tx) => {
                tx.wait().then(async (receipt) => {
                    console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`);
                    try {
                        resolve(true);
                    } catch (err) {
                        console.log(err);
                        resolve(false);
                    }
                });
            })
            .catch(reject);
    });
};

/*
  調用方法
  
    TransactionCallBack(provider, result)
      .then((isSuccess) => {
        console.log("Success :" + isSuccess)
      })
      .catch((error) => {
        console.log("Error :" + error)
      })

*/
export default TransactionCallBack;
