import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Global crash guard: a render throw anywhere in the tree used to leave the
// production app on a white screen. Data is safe (localStorage + Firestore
// sync); this just gives the athlete a way back in.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Nexus L4 crashed:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h1 className="font-brutalist text-3xl uppercase tracking-widest text-rose-500">
          Fallo crítico del sistema
        </h1>
        <p className="font-mono text-sm text-neutral-400 max-w-md">
          Algo se rompió al renderizar. Tus registros están a salvo (guardados
          en el dispositivo y sincronizados a la nube).
        </p>
        <p className="font-mono text-xs text-neutral-600 max-w-md break-all">
          {this.state.error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="border border-electric-blue px-6 py-3 font-brutalist uppercase tracking-wider text-electric-blue hover:bg-electric-blue hover:text-black transition-colors"
        >
          Recargar Nexus L4
        </button>
      </div>
    );
  }
}
