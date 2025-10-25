const getZkConditions = async () => {
  const signedMessage = await signAuthMessage(privateKey);
  const config = {
    method: "get",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${signedMessage}`,
    },
  };
  const response = await axios({
    url: `https://encryption.lighthouse.storage/api/getZkConditions/${cid}`,
    ...config,
  });
  console.log(response.data);
};
