const verifyAndDecrypt = async () => {
  const cid = "bafkreibwimyyrqiqhl7difiu3gl6a5znf2ml7tgrh3uekfsitvrqczkzr4";
  const publicKey = "0xa3c960b3ba29367ecbcaf1430452c6cd7516f588";
  const nodeId = [1, 2, 3, 4, 5];
  const nodeUrl = nodeId.map(
    (elem) =>
      `https://encryption.lighthouse.storage/api/verifyZkConditions/${elem}`,
  );
  const signedMessage = await signAuthMessage(privateKey);
  const config = {
    method: "post",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${signedMessage}`,
    },
  };
  const apidata = {
    address: publicKey,
    cid: cid,
    proof: proof_from_reclaim_protocol,
  };
  const requestData = async (url) => {
    try {
      return await axios({
        url,
        data: apidata,
        ...config,
      });
    } catch (error) {
      console.log(error);
      return {
        isSuccess: false,
        error: JSON.parse(error.message),
      };
    }
  };
  const shards = [];
  for (const [index, url] of nodeUrl.entries()) {
    const response = await requestData(url);
    shards.push(response.data.payload);
  }

  const { masterKey: key, error: recoverError } = await recoverKey(shards);
  if (recoverError) {
    throw recoverError;
  }

  const decrypted = await decryptFile(cid, key);

  fs.createWriteStream("fileName.png").write(Buffer.from(decrypted));
  return "File decrypted successfully";
};
