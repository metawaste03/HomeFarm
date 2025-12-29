
import React, { useState, useRef } from 'react';
import { CameraIcon, CloseIcon, StethoscopeIcon, PillIcon, PlusIcon } from './icons';
import { Batch } from './BatchManagementScreen';

interface HealthLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: HealthLogData) => void;
    batch: Batch | null;
}

export interface HealthLogData {
    date: string;
    time: string;
    symptoms: string[];
    medication: string;
    dosage: string;
    photo: string | null;
    notes: string;
}

const COMMON_SYMPTOMS = [
    "Lethargy", "Coughing", "Sneezing", "Watery Droppings", 
    "Reduced Appetite", "Isolating", "Weight Loss", "Pale Combs", "Bloating"
];

const HealthLogModal: React.FC<HealthLogModalProps> = ({ isOpen, onClose, onSave, batch }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
    const [customSymptom, setCustomSymptom] = useState('');
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [medication, setMedication] = useState('');
    const [dosage, setDosage] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const toggleSymptom = (symptom: string) => {
        setSelectedSymptoms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(symptom)) {
                newSet.delete(symptom);
            } else {
                newSet.add(symptom);
            }
            return newSet;
        });
    };

    const handleAddCustomSymptom = () => {
        if (customSymptom.trim()) {
            toggleSymptom(customSymptom.trim());
            setCustomSymptom('');
            setIsAddingCustom(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const data: HealthLogData = {
            date,
            time,
            symptoms: Array.from(selectedSymptoms),
            medication,
            dosage,
            photo: photoPreview,
            notes
        };
        onSave(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-danger">
                            <StethoscopeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Health Log</h3>
                            <p className="text-xs text-text-secondary">{batch?.name || 'Unknown Batch'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:bg-muted rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-6 overflow-y-auto">
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-background text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-background text-text-primary" />
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Observed Symptoms</label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_SYMPTOMS.map(symptom => (
                                <button
                                    key={symptom}
                                    onClick={() => toggleSymptom(symptom)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                        selectedSymptoms.has(symptom)
                                            ? 'bg-red-100 border-danger text-danger dark:bg-red-900/30'
                                            : 'bg-background border-border text-text-secondary hover:border-primary'
                                    }`}
                                >
                                    {symptom}
                                </button>
                            ))}
                            {(Array.from(selectedSymptoms) as string[]).filter(s => !COMMON_SYMPTOMS.includes(s)).map(s => (
                                <button key={s} onClick={() => toggleSymptom(s)} className="px-3 py-1.5 rounded-full text-sm font-medium border bg-red-100 border-danger text-danger dark:bg-red-900/30">
                                    {s}
                                </button>
                            ))}
                            
                            {isAddingCustom ? (
                                <div className="flex items-center gap-2 mt-1 w-full">
                                    <input 
                                        type="text" 
                                        value={customSymptom} 
                                        onChange={e => setCustomSymptom(e.target.value)} 
                                        placeholder="Type symptom..."
                                        className="flex-grow p-2 text-sm border border-border rounded-lg bg-background text-text-primary"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleAddCustomSymptom()}
                                    />
                                    <button onClick={handleAddCustomSymptom} className="bg-primary text-white p-2 rounded-lg text-xs font-bold">ADD</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsAddingCustom(true)} className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-primary text-primary hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1">
                                    <PlusIcon className="w-4 h-4" /> Custom
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Medication */}
                    <div className="bg-muted p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <PillIcon className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Treatment</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Medication / Vaccine</label>
                                <input type="text" value={medication} onChange={e => setMedication(e.target.value)} placeholder="e.g., Tetracycline" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Dosage / Instructions</label>
                                <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 5ml per liter" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Visual Evidence</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                        />
                        
                        {photoPreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-border group">
                                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                                <button 
                                    onClick={() => setPhotoPreview(null)}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors bg-muted/30"
                            >
                                <CameraIcon className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Tap to Upload Photo</span>
                                <span className="text-xs opacity-70">Camera or Gallery</span>
                            </button>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Additional Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="Describe the behavior or other observations..." 
                            className="w-full p-3 border border-border rounded-lg bg-background text-text-primary min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border bg-card sticky bottom-0 z-10">
                    <button 
                        onClick={handleSave}
                        className="w-full bg-danger text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                    >
                        SAVE HEALTH LOG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthLogModal;
