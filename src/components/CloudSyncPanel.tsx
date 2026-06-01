import React from "react";
import { CloudLightning, ShieldCheck, LogOut } from "lucide-react";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { pushAllLocalToCloud } from "../lib/syncEngine";

interface CloudSyncPanelProps {
  currentUser: User | null;
  isCloudSyncing: boolean;
  setIsCloudSyncing: (syncing: boolean) => void;
  syncStatus: {
    hasPendingWrites: boolean;
    isOnline: boolean;
  };
  setConfettiTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export default function CloudSyncPanel({
  currentUser,
  isCloudSyncing,
  setIsCloudSyncing,
  syncStatus,
  setConfettiTrigger,
}: CloudSyncPanelProps) {
  return (
    <section
      className="mt-4 p-5 border border-white/10 bg-pure-black/95 relative overflow-hidden"
      data-purpose="cloud-sync-panel"
    >
      <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-brutalist text-6xl text-white">
        CLOUD
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-brutalist tracking-wider text-pure-white flex items-center gap-2">
            <CloudLightning className="text-electric-blue" size={20} />
            SISTEMA DE PERSISTENCIA EN LA NUBE
          </h4>
          <p className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
            // REGISTRO Y TRACKING METABÓLICO SEGURO
          </p>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>SINCRO ACTIVO ● CONECTADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 px-3 py-1 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>
              OFFLINE EN LA NUBE (ALMACENAMIENTO REMOTO DESACTIVADO)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Column: Description */}
        <div className="space-y-2 text-left">
          <p className="font-condensed text-neutral-400 font-bold text-xs sm:text-sm leading-relaxed">
            La Ley del Estímulo CF-L4 exige precisión absoluta. Al
            registrarte en la nube, todos tus entrenamientos, cargas
            reales, históricos de RPE, perfiles de volumen de trabajo y
            misiones diarias se respaldan de inmediato.
          </p>
          <p className="font-mono text-[10px] text-neutral-500 leading-normal uppercase">
            * Compatible con múltiples dispositivos. Inicia sesión en tu
            box mediante tu móvil o tableta para ver tus RMs y cargas de
            trabajo al instante.
          </p>
        </div>

        {/* Middle Column: User details or login trigger */}
        <div className="bg-[#0b0c10] border border-white/5 p-4 flex flex-col justify-center min-h-[110px]">
          {currentUser ? (
            <div className="flex items-center gap-3 text-left">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ""}
                  className="w-12 h-12 rounded-full border-2 border-electric-blue shrink-0 shadow-md shadow-electric-blue/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center text-white font-brutalist text-xl rounded-full shrink-0">
                  {currentUser.displayName
                    ? currentUser.displayName[0].toUpperCase()
                    : "U"}
                </div>
              )}
              <div className="space-y-0.5 overflow-hidden">
                <div className="text-md font-bold font-brutalist text-white tracking-wide truncate">
                  {currentUser.displayName || "ATLETA ACTIVO"}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 truncate uppercase">
                  {currentUser.email}
                </div>
                <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck size={10} /> VERIFICADO [CF-L4 ACCESO]
                </div>
                <div className="text-[9px] font-mono whitespace-nowrap flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  {syncStatus.hasPendingWrites ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      ● SINCRO ACTIVA (RESPALDO PENDIENTE...)
                    </span>
                  ) : !syncStatus.isOnline ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      ● BASE DE DATOS SIN RED (MODO SEGURO ACTIVO)
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      ● COLA SINCRO AL DÍA (TIEMPO REAL)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-center py-2">
              <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                SINCRO DESACTIVADO // SIN SESIÓN INICIADA
              </p>
              <div className="text-[9px] font-mono text-neutral-500">
                CONECTA GOOGLE AUTH PARA ACTIVAR EL RESPALDO
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col gap-2.5 h-full justify-center">
          {currentUser ? (
            <>
              <button
                onClick={async () => {
                  if (!currentUser) return;
                  setIsCloudSyncing(true);
                  try {
                    await pushAllLocalToCloud(currentUser.uid);
                    setConfettiTrigger((v) => v + 1);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsCloudSyncing(false);
                  }
                }}
                disabled={isCloudSyncing}
                className="w-full bg-electric-blue text-pure-white hover:bg-white hover:text-pure-black font-brutalist py-2.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none shadow-md shadow-electric-blue/15 disabled:opacity-50"
              >
                {isCloudSyncing
                  ? "SINCRO-RESPALDO EN PROCESO..."
                  : "🚀 SUBIR HISTORIAL COMPLETO"}
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white font-mono py-2 text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={11} /> CERRAR ACCESO SEGURO
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                try {
                  await signInWithPopup(auth, googleProvider);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full bg-pure-white text-pure-black hover:bg-neutral-200 font-brutalist py-3.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2 select-none font-bold"
            >
              🔐 INICIAR SESIÓN CON GOOGLE
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
