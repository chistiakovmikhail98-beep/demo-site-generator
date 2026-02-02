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
  Check
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  niche: string;
  status: string;
  deployed_url?: string;
  created_at: string;
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

export default function MySites() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [crmData, setCrmData] = useState<Record<string, ProjectCRM>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectCRM>>({});

  // Загрузка проектов
  useEffect(() => {
    fetchProjects();
    loadCrmData();
  }, []);

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
    } catch (error) {
      console.error('Ошибка удаления:', error);
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
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {projects.length} {projects.length === 1 ? 'проект' : 'проектов'}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Новый сайт
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {projects.length === 0 ? (
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
            {/* Таблица */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Название</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Админы ВК</th>
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
                      <tr key={project.id} className="hover:bg-gray-50 transition">
                        {/* Название */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(project.created_at).toLocaleDateString('ru')}
                          </div>
                        </td>

                        {/* Админы ВК */}
                        <td className="px-4 py-3">
                          {crm.admins && crm.admins.length > 0 ? (
                            <div className="space-y-1">
                              {crm.admins.slice(0, 2).map((admin, idx) => (
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
                              {crm.admins.length > 2 && (
                                <div className="text-xs text-gray-400">+{crm.admins.length - 2} ещё</div>
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
        )}
      </div>
    </div>
  );
}
