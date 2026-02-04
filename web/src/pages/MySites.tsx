import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Link,
  Send,
  Check,
  Inbox,
  Clock,
  MessageSquare,
  Play,
  Pause,
  Upload,
  List,
  MapPin,
  Globe
} from 'lucide-react';

// Типы для лидов
interface Lead {
  id: string;
  name: string;
  phone: string;
  messenger?: string;
  studio_name: string;
  studio_phone?: string;
  source_url?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  notes?: string;
  created_at: string;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'Новая', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Связались', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'converted', label: 'Конверсия', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Отказ', color: 'bg-red-100 text-red-700' },
];

interface Project {
  id: string;
  name: string;
  niche: string;
  status: string;
  deployed_url?: string;
  created_at: string;
  // VK данные из БД
  vk_group_url?: string;
  vk_admins?: AdminContact[];
  vk_contacts?: {
    phone?: string;
    email?: string;
    address?: string;
    site?: string;
  };
}

// Статус batch очереди
interface BatchStatus {
  batchId: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  progress: number;
}

interface QueueStatus {
  isRunning: boolean;
  isPaused: boolean;
  currentItem: {
    id: string;
    vkUrl: string;
    startedAt: string;
  } | null;
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

// Контакт администратора
interface AdminContact {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkUrl?: string;
}

// Статусы рассылки
type MailingStatus = 'none' | 'sent' | 'replied' | 'interested' | 'rejected' | 'deal';

const MAILING_STATUSES: { value: MailingStatus; label: string; color: string }[] = [
  { value: 'none', label: '—', color: 'bg-gray-100 text-gray-500' },
  { value: 'sent', label: 'Отправлено', color: 'bg-blue-100 text-blue-700' },
  { value: 'replied', label: 'Ответили', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'interested', label: 'Интерес', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Отказ', color: 'bg-red-100 text-red-700' },
  { value: 'deal', label: 'Сделка', color: 'bg-purple-100 text-purple-700' },
];

// Дополнительные данные для CRM (хранятся в localStorage)
interface ProjectCRM {
  contact: string;        // Телефон/контакт
  customLink: string;     // Дополнительная ссылка
  mailingDone: boolean;   // Отправлена рассылка (legacy)
  mailingStatus?: MailingStatus; // Статус рассылки
  notes: string;          // Заметки
  admins?: AdminContact[]; // Контакты админов из ВК
  vkGroupUrl?: string;    // Ссылка на сообщество ВК
}

const STORAGE_KEY = 'demo_sites_crm';
const API_URL = import.meta.env.VITE_API_URL || '';

// Ниши для batch
const NICHE_OPTIONS = [
  { value: 'dance', label: 'Танцы' },
  { value: 'stretching', label: 'Растяжка' },
  { value: 'fitness', label: 'Фитнес' },
  { value: 'yoga', label: 'Йога' },
  { value: 'wellness', label: 'Wellness' },
];

export default function MySites() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sites' | 'leads' | 'batch'>('sites');
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [crmData, setCrmData] = useState<Record<string, ProjectCRM>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Batch state
  const [batchUrls, setBatchUrls] = useState('');
  const [batchNiche, setBatchNiche] = useState('dance');
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectCRM>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Загрузка проектов
  useEffect(() => {
    fetchProjects();
    loadCrmData();
  }, []);

  // Загрузка лидов при переключении на вкладку
  useEffect(() => {
    if (activeTab === 'leads' && leads.length === 0) {
      fetchLeads();
    }
  }, [activeTab]);

  // Загрузка статуса очереди при переключении на batch
  useEffect(() => {
    if (activeTab === 'batch') {
      fetchQueueStatus();
      // Автообновление каждые 3 секунды
      const interval = setInterval(fetchQueueStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Автообновление статуса batch
  useEffect(() => {
    if (batchStatus && batchStatus.pending > 0) {
      const interval = setInterval(() => fetchBatchStatus(batchStatus.batchId), 3000);
      return () => clearInterval(interval);
    }
  }, [batchStatus?.batchId, batchStatus?.pending]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const response = await fetch(`${API_URL}/api/leads`);
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // === BATCH ФУНКЦИИ ===

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/batch-vk/status`);
      const data = await response.json();
      setQueueStatus(data);
    } catch (error) {
      console.error('Ошибка загрузки статуса очереди:', error);
    }
  };

  const fetchBatchStatus = async (batchId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/batch-vk/${batchId}/status`);
      const data = await response.json();
      setBatchStatus(data);
    } catch (error) {
      console.error('Ошибка загрузки статуса batch:', error);
    }
  };

  const startBatch = async () => {
    const urls = batchUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.includes('vk.com') || url.includes('vk.ru'));

    if (urls.length === 0) {
      setBatchError('Введите хотя бы одну ссылку на группу ВК');
      return;
    }

    setIsBatchLoading(true);
    setBatchError(null);

    try {
      const response = await fetch(`${API_URL}/api/batch-vk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vkUrls: urls,
          options: {
            niche: batchNiche,
            analyzePhotos: true,
            extractColors: true,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка запуска batch');
      }

      setBatchStatus({
        batchId: data.batchId,
        total: data.totalItems,
        completed: 0,
        failed: 0,
        pending: data.totalItems,
        processing: 0,
        progress: 0,
      });

      setBatchUrls('');
    } catch (error) {
      setBatchError(error instanceof Error ? error.message : 'Ошибка запуска batch');
    } finally {
      setIsBatchLoading(false);
    }
  };

  const pauseQueue = async () => {
    try {
      await fetch(`${API_URL}/api/batch-vk/pause`, { method: 'POST' });
      fetchQueueStatus();
    } catch (error) {
      console.error('Ошибка паузы:', error);
    }
  };

  const resumeQueue = async () => {
    try {
      await fetch(`${API_URL}/api/batch-vk/resume`, { method: 'POST' });
      fetchQueueStatus();
    } catch (error) {
      console.error('Ошибка возобновления:', error);
    }
  };

  const retryFailed = async () => {
    try {
      const response = await fetch(`${API_URL}/api/batch-vk/retry-failed`, { method: 'POST' });
      const data = await response.json();
      alert(`Повторно запущено: ${data.retriedCount} элементов`);
      fetchQueueStatus();
    } catch (error) {
      console.error('Ошибка retry:', error);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string, notes?: string) => {
    try {
      await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      // Обновляем локально
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: status as Lead['status'], notes } : lead
      ));
    } catch (error) {
      console.error('Ошибка обновления заявки:', error);
    }
  };

  // Загрузка CRM данных из localStorage
  const loadCrmData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCrmData(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Ошибка загрузки CRM данных:', e);
    }
  };

  // Сохранение CRM данных в localStorage
  const saveCrmData = (data: Record<string, ProjectCRM>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setCrmData(data);
  };

  // Получение CRM данных для проекта
  const getCrm = (projectId: string): ProjectCRM => {
    return crmData[projectId] || { contact: '', customLink: '', mailingDone: false, mailingStatus: 'none', notes: '' };
  };

  // Начать редактирование
  const startEdit = (projectId: string) => {
    setEditingId(projectId);
    setEditForm(getCrm(projectId));
  };

  // Сохранить редактирование
  const saveEdit = (projectId: string) => {
    const current = getCrm(projectId);
    const newData = {
      ...crmData,
      [projectId]: {
        ...current,
        contact: editForm.contact || '',
        customLink: editForm.customLink || '',
        mailingDone: editForm.mailingDone || false,
        mailingStatus: editForm.mailingStatus || current.mailingStatus || 'none',
        notes: editForm.notes || '',
      }
    };
    saveCrmData(newData);
    setEditingId(null);
    setEditForm({});
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Установка статуса рассылки
  const setMailingStatus = (projectId: string, status: MailingStatus) => {
    const current = getCrm(projectId);
    const newData = {
      ...crmData,
      [projectId]: { ...current, mailingStatus: status }
    };
    saveCrmData(newData);
  };

  // Удаление проекта
  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Удалить проект "${project.name}"?`)) return;

    try {
      await fetch(`${API_URL}/api/projects/${project.id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== project.id));
      // Удаляем CRM данные
      const newCrm = { ...crmData };
      delete newCrm[project.id];
      saveCrmData(newCrm);
      // Убираем из выбранных
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(project.id);
        return next;
      });
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Выбор/снятие выбора проекта
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Выбрать все / снять выбор со всех
  const toggleSelectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)));
    }
  };

  // Массовое удаление
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Удалить ${selectedIds.size} проект(ов)?`)) return;

    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    const newCrm = { ...crmData };

    try {
      // Удаляем параллельно
      await Promise.all(
        idsToDelete.map(id =>
          fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' })
        )
      );

      // Обновляем локальное состояние
      setProjects(prev => prev.filter(p => !selectedIds.has(p.id)));

      // Удаляем CRM данные
      idsToDelete.forEach(id => delete newCrm[id]);
      saveCrmData(newCrm);

      // Очищаем выбор
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      alert('Не удалось удалить некоторые проекты');
    } finally {
      setIsDeleting(false);
    }
  };

  // Перегенерация
  const handleRegenerate = async (project: Project) => {
    try {
      await fetch(`${API_URL}/api/projects/${project.id}/regenerate`, { method: 'POST' });
      fetchProjects();
    } catch (error) {
      console.error('Ошибка перегенерации:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      building: 'bg-indigo-100 text-indigo-700',
      deploying: 'bg-purple-100 text-purple-700',
    };
    const labels: Record<string, string> = {
      completed: 'Готово',
      failed: 'Ошибка',
      pending: 'В очереди',
      processing: 'AI анализ',
      building: 'Сборка',
      deploying: 'Деплой',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Мои сайты</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Новый сайт
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b -mb-px">
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sites'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              Сайты
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{projects.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Заявки
              {leads.filter(l => l.status === 'new').length > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.status === 'new').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'batch'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              Batch VK
              {queueStatus?.isRunning && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {queueStatus.stats.processing > 0 ? 'Работает' : 'Активна'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* === TAB: SITES === */}
        {activeTab === 'sites' && (projects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Пока нет проектов</p>
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 font-medium hover:underline"
            >
              Создать первый сайт
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Панель массовых действий */}
            {selectedIds.size > 0 && (
              <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-indigo-700">
                  Выбрано: <strong>{selectedIds.size}</strong> из {projects.length}
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Удалить выбранные
                </button>
              </div>
            )}
            {/* Таблица */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === projects.length && projects.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Название</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Админы ВК</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Контакты студии
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ниша</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ссылка</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Контакт</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Доп. ссылка</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Статус рассылки
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Заметки</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map(project => {
                    const crm = getCrm(project.id);
                    const isEditing = editingId === project.id;

                    return (
                      <tr key={project.id} className={`hover:bg-gray-50 transition ${selectedIds.has(project.id) ? 'bg-indigo-50' : ''}`}>
                        {/* Чекбокс */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(project.id)}
                            onChange={() => toggleSelect(project.id)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        {/* Название */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(project.created_at).toLocaleDateString('ru')}
                          </div>
                        </td>

                        {/* Админы ВК (из БД или localStorage как fallback) */}
                        <td className="px-4 py-3">
                          {(() => {
                            const admins = project.vk_admins || crm.admins;
                            if (admins && admins.length > 0) {
                              return (
                                <div className="space-y-1">
                                  {admins.slice(0, 2).map((admin, idx) => (
                                    <div key={idx} className="text-xs">
                                      {admin.name && (
                                        <div className="font-medium text-gray-800">{admin.name}</div>
                                      )}
                                      {admin.role && (
                                        <div className="text-gray-400">{admin.role}</div>
                                      )}
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {admin.phone && (
                                          <a href={`tel:${admin.phone}`} className="text-indigo-600 hover:underline flex items-center gap-0.5">
                                            <Phone className="w-2.5 h-2.5" />
                                            {admin.phone}
                                          </a>
                                        )}
                                        {admin.vkUrl && (
                                          <a href={admin.vkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            VK
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {admins.length > 2 && (
                                    <div className="text-xs text-gray-400">+{admins.length - 2} ещё</div>
                                  )}
                                </div>
                              );
                            }
                            return <span className="text-gray-400 text-sm">—</span>;
                          })()}
                        </td>

                        {/* Контакты студии */}
                        <td className="px-4 py-3">
                          {project.vk_contacts ? (
                            <div className="text-xs space-y-0.5">
                              {project.vk_contacts.phone && (
                                <a href={`tel:${project.vk_contacts.phone}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  {project.vk_contacts.phone}
                                </a>
                              )}
                              {project.vk_contacts.email && (
                                <a href={`mailto:${project.vk_contacts.email}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5" />
                                  {project.vk_contacts.email}
                                </a>
                              )}
                              {project.vk_contacts.address && (
                                <div className="text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-[120px]" title={project.vk_contacts.address}>
                                    {project.vk_contacts.address}
                                  </span>
                                </div>
                              )}
                              {project.vk_contacts.site && (
                                <a href={project.vk_contacts.site} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  <Globe className="w-2.5 h-2.5" />
                                  Сайт
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Ниша */}
                        <td className="px-4 py-3 text-sm text-gray-600">{project.niche}</td>

                        {/* Статус */}
                        <td className="px-4 py-3">{getStatusBadge(project.status)}</td>

                        {/* Ссылка на сайт */}
                        <td className="px-4 py-3">
                          {project.deployed_url ? (
                            <a
                              href={project.deployed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Открыть
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Контакт */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.contact || ''}
                              onChange={e => setEditForm({ ...editForm, contact: e.target.value })}
                              placeholder="+7..."
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {crm.contact ? (
                                <>
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {crm.contact}
                                </>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Доп. ссылка */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.customLink || ''}
                              onChange={e => setEditForm({ ...editForm, customLink: e.target.value })}
                              placeholder="https://..."
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : crm.customLink ? (
                            <a
                              href={crm.customLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                            >
                              <Link className="w-3 h-3" />
                              Ссылка
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Статус рассылки */}
                        <td className="px-4 py-3">
                          <select
                            value={crm.mailingStatus || 'none'}
                            onChange={(e) => setMailingStatus(project.id, e.target.value as MailingStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                              MAILING_STATUSES.find(s => s.value === (crm.mailingStatus || 'none'))?.color || 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {MAILING_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Заметки */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.notes || ''}
                              onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                              placeholder="Заметки..."
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                              {crm.notes || <span className="text-gray-400">—</span>}
                            </span>
                          )}
                        </td>

                        {/* Действия */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(project.id)}
                                  className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                                  title="Сохранить"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                  title="Отмена"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(project.id)}
                                  className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600"
                                  title="Редактировать"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRegenerate(project)}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                  title="Перегенерировать"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project)}
                                  className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Подсказка */}
            <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> Нажмите карандаш для редактирования
              </span>
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3" /> Выберите статус рассылки в выпадающем списке
              </span>
            </div>
          </div>
        ))}

        {/* === TAB: LEADS === */}
        {activeTab === 'leads' && (
          isLoadingLeads ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-gray-500 mt-4">Загрузка заявок...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Пока нет заявок</p>
              <p className="text-sm text-gray-400">Заявки появятся, когда кто-то заполнит форму на демо-сайте</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Дата</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Имя</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Телефон</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Мессенджер</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Студия</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Источник</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map(lead => (
                      <tr key={lead.id} className={`hover:bg-gray-50 transition ${lead.status === 'new' ? 'bg-blue-50/50' : ''}`}>
                        {/* Дата */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {new Date(lead.created_at).toLocaleString('ru', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        {/* Имя */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{lead.name}</div>
                        </td>

                        {/* Телефон */}
                        <td className="px-4 py-3">
                          <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        </td>

                        {/* Мессенджер */}
                        <td className="px-4 py-3">
                          {lead.messenger === 'telegram' ? (
                            <span className="text-sm text-blue-600 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Telegram
                            </span>
                          ) : lead.messenger === 'whatsapp' ? (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Студия */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{lead.studio_name}</div>
                          {lead.studio_phone && (
                            <div className="text-xs text-gray-400">{lead.studio_phone}</div>
                          )}
                        </td>

                        {/* Источник */}
                        <td className="px-4 py-3">
                          {lead.source_url ? (
                            <a
                              href={lead.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Сайт
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Статус */}
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                              LEAD_STATUSES.find(s => s.value === lead.status)?.color || 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {LEAD_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <span>Всего заявок: {leads.length}</span>
                <button
                  onClick={fetchLeads}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                >
                  <RefreshCw className="w-3 h-3" />
                  Обновить
                </button>
              </div>
            </div>
          )
        )}

        {/* === TAB: BATCH === */}
        {activeTab === 'batch' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка: ввод ссылок */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-600" />
                Массовая загрузка VK групп
              </h2>

              <div className="space-y-4">
                {/* Textarea для ссылок */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ссылки на группы ВК (по одной на строку)
                  </label>
                  <textarea
                    value={batchUrls}
                    onChange={(e) => setBatchUrls(e.target.value)}
                    placeholder={`https://vk.com/dance_studio1\nhttps://vk.com/fitness_club\nhttps://vk.ru/yoga_center\n...`}
                    className="w-full h-48 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Найдено ссылок: {batchUrls.split('\n').filter(url => url.includes('vk.com') || url.includes('vk.ru')).length}
                  </p>
                </div>

                {/* Выбор ниши */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ниша
                  </label>
                  <select
                    value={batchNiche}
                    onChange={(e) => setBatchNiche(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {NICHE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Ошибка */}
                {batchError && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {batchError}
                  </div>
                )}

                {/* Кнопка запуска */}
                <button
                  onClick={startBatch}
                  disabled={isBatchLoading || !batchUrls.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBatchLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Запуск...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Запустить генерацию
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Правая колонка: статус очереди */}
            <div className="space-y-6">
              {/* Статус текущего batch */}
              {batchStatus && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Текущий Batch
                  </h3>

                  {/* Прогресс-бар */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Прогресс</span>
                      <span>{batchStatus.completed} / {batchStatus.total}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${batchStatus.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-600">{batchStatus.pending}</div>
                      <div className="text-xs text-yellow-700">В очереди</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{batchStatus.processing}</div>
                      <div className="text-xs text-blue-700">В работе</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">{batchStatus.completed}</div>
                      <div className="text-xs text-green-700">Готово</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-600">{batchStatus.failed}</div>
                      <div className="text-xs text-red-700">Ошибки</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Общий статус очереди */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className={`w-5 h-5 ${queueStatus?.isRunning ? 'text-green-600 animate-spin' : 'text-gray-400'}`} />
                  Статус очереди
                </h3>

                {queueStatus ? (
                  <div className="space-y-4">
                    {/* Статус */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Состояние:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        queueStatus.isRunning
                          ? queueStatus.isPaused
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {queueStatus.isRunning
                          ? queueStatus.isPaused ? 'На паузе' : 'Работает'
                          : 'Остановлена'}
                      </span>
                    </div>

                    {/* Текущий элемент */}
                    {queueStatus.currentItem && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-blue-700 font-medium">Сейчас обрабатывается:</div>
                        <a
                          href={queueStatus.currentItem.vkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm truncate block"
                        >
                          {queueStatus.currentItem.vkUrl}
                        </a>
                      </div>
                    )}

                    {/* Общая статистика */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Всего:</span>
                        <span className="font-medium">{queueStatus.stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">В очереди:</span>
                        <span className="font-medium">{queueStatus.stats.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Готово:</span>
                        <span className="font-medium text-green-600">{queueStatus.stats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ошибки:</span>
                        <span className="font-medium text-red-600">{queueStatus.stats.failed}</span>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex gap-2 pt-2">
                      {queueStatus.isRunning && !queueStatus.isPaused ? (
                        <button
                          onClick={pauseQueue}
                          className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg font-medium hover:bg-yellow-200 transition flex items-center justify-center gap-2"
                        >
                          <Pause className="w-4 h-4" />
                          Пауза
                        </button>
                      ) : queueStatus.isPaused ? (
                        <button
                          onClick={resumeQueue}
                          className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Продолжить
                        </button>
                      ) : null}

                      {queueStatus.stats.failed > 0 && (
                        <button
                          onClick={retryFailed}
                          className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Повторить ошибки ({queueStatus.stats.failed})
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                    Загрузка статуса...
                  </div>
                )}
              </div>

              {/* Подсказка */}
              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                <p className="font-medium mb-2">Как это работает:</p>
                <ol className="list-decimal list-inside space-y-1 text-indigo-600">
                  <li>Вставьте ссылки на группы ВК</li>
                  <li>Выберите нишу</li>
                  <li>Нажмите "Запустить"</li>
                  <li>Система обработает каждую группу</li>
                  <li>Готовые сайты появятся во вкладке "Сайты"</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
