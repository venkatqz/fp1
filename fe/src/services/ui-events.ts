type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
    id?: string;
    title?: string;
    msg: string;
    type: ToastType;
    duration?: number;
}

type LoaderListener = (isVisible: boolean) => void;
type ToastListener = (toast: ToastConfig) => void;

class UIEventsService {
    private static instance: UIEventsService;
    private loaderListeners: LoaderListener[] = [];
    private toastListeners: ToastListener[] = [];

    private constructor() { }

    public static getInstance(): UIEventsService {
        if (!UIEventsService.instance) {
            UIEventsService.instance = new UIEventsService();
        }
        return UIEventsService.instance;
    }

    // --- Loader Methods --- (Placeholder for later)
    public showLoader() {
        this.loaderListeners.forEach(l => l(true));
    }

    public hideLoader() {
        this.loaderListeners.forEach(l => l(false));
    }

    public subscribeLoader(listener: LoaderListener): () => void {
        this.loaderListeners.push(listener);
        return () => {
            this.loaderListeners = this.loaderListeners.filter(l => l !== listener);
        };
    }

    // --- Toaster Methods ---
    public showToast(config: ToastConfig) {
        const toast = {
            ...config,
            id: config.id || Math.random().toString(36).substring(7),
            duration: config.duration || 5000
        };
        this.toastListeners.forEach(l => l(toast));
    }

    public subscribeToast(listener: ToastListener): () => void {
        this.toastListeners.push(listener);
        return () => {
            this.toastListeners = this.toastListeners.filter(l => l !== listener);
        };
    }
}

export const uiEvents = UIEventsService.getInstance();
