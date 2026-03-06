import { toast } from "sonner";
import { Toast } from "../components/Toast";

export function showErrorToast(message: string) {
  toast(() => <Toast message={message} type="error" />);
}

export function showSuccessToast(message: string) {
  toast(() => <Toast message={message} type="success" />);
}
