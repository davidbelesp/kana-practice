declare module "*/handwriting" {
  const handwriting: {
    recognize: (
      trace: number[][][],
      options: {
        language: string;
        numOfReturn: number;
      },
      callback: (results: string[]) => void,
      onError?: (err: any) => void,
    ) => void;
  };
  export default handwriting;
}
