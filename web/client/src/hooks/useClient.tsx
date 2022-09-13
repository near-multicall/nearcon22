import { Web3Storage } from "web3.storage";

export function useClient() {
  const getAccessToken = () => {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNiOGEyMEY0QTEzMTUyQ2IyNDBFY0ZBY2ZGMUI0NjBhMkYzNkE3MDAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMwNzI1OTM1NDUsIm5hbWUiOiJub19jYXBfZHJvcCJ9.VQZq11WZb4Ck6ieEyQbXODWY_Xj-TJ4S53nK2k-ilo4";
  };

  return new Web3Storage({ token: getAccessToken() });
}
