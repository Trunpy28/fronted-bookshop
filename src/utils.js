export const isJsonString = (data) => {
    try {
        JSON.parse(data);
    } catch (e) {
        return false;
    }
    return true;
}

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const renderOptions = (arr) => {
  let results = [];
  if(arr) {
    results = arr?.map((opt) => {
      return {
        value: opt,
        label: opt,
      }
    })
  }
  results.push({
    value: 'Thêm type',
    label: 'Thêm loại sản phẩm',
  })
  return results;
}

export const convertPrice = (price) => {
  try {
      const result  = price?.toLocaleString().replaceAll(',', '.')
      return `${result} đ`
  } catch (error) {
      return null
  }
}

export const timeTranform = (time) => {
  const date = new Date(time);

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };
  return date.toLocaleString('vi-VN',options);
}