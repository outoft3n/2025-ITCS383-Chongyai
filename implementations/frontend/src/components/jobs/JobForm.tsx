'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Job, CreateJobForm } from '@/types';

const CreateJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' },
];

interface JobFormProps {
  defaultValues?: Partial<Job>;
  onSubmit: (data: CreateJobForm) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function JobForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Post Job' }: JobFormProps) {
  const [skills, setSkills] = useState<string[]>(defaultValues?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof CreateJobSchema>>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      requirements: defaultValues?.requirements ?? '',
      location: defaultValues?.location ?? '',
      jobType: defaultValues?.jobType ?? 'FULL_TIME',
      salaryMin: defaultValues?.salaryMin ?? undefined,
      salaryMax: defaultValues?.salaryMax ?? undefined,
      expiresAt: defaultValues?.expiresAt ? new Date(defaultValues.expiresAt).toISOString().slice(0, 16) : '',
    },
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleFormSubmit = async (data: z.infer<typeof CreateJobSchema>) => {
    await onSubmit({ ...data, skills });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input label="Job Title" error={errors.title?.message} {...register('title')} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Requirements</label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          {...register('requirements')}
        />
        {errors.requirements && <p className="text-sm text-red-600">{errors.requirements.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Location" error={errors.location?.message} {...register('location')} />
        <Select
          label="Job Type"
          options={JOB_TYPE_OPTIONS}
          error={errors.jobType?.message}
          {...register('jobType')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Min Salary (฿)" type="number" error={errors.salaryMin?.message} {...register('salaryMin')} />
        <Input label="Max Salary (฿)" type="number" error={errors.salaryMax?.message} {...register('salaryMax')} />
      </div>

      <Input label="Expires At (optional)" type="datetime-local" {...register('expiresAt')} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Skills</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add skill (press Enter)"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="button" onClick={addSkill} size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-sm px-2.5 py-1 rounded-full">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
