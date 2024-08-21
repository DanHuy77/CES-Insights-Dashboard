import showdown from "showdown";

export const convertToHtml = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};
