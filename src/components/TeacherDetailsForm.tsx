import React, { useState, KeyboardEvent, useEffect } from 'react';
import { useUpdateTeacherDetailsMutation, useGetTeacherDetailsQuery } from '@/store/api/teacherApi';
import { countries } from '@/data/countries';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { subjects, grades } from '@/data/common/collections';

const TeacherDetailsForm = () => {
  // Fetch user data from the auth store
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Fetch teacher details based on user ID
  const { data: teacherDetails, isLoading } = useGetTeacherDetailsQuery(Number(authUser?.id), {
    skip: !authUser?.id,
  });

  // Zod schema for validation
  const teacherSchema = z.object({
    subjects: z.array(z.string()).optional(),
    grades: z.array(z.string()).optional(),
    pricing: z.number().positive('Enter valid pricing').optional(),
    currentSchool: z.string().optional(),
    teachingExperience: z.number().optional(),
    location: z.string().optional(),
    primaryContact: z.string().optional(),
  });

  type TeacherFormValues = z.infer<typeof teacherSchema>;

  const defaultValues: TeacherFormValues = {
    subjects: [],
    grades: [],
    pricing: 0,
    currentSchool: '',
    teachingExperience: 0,
    location: '',
    primaryContact: '',
  };

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues,
  });

  const subjectsWatch = watch('subjects') || [];
  const gradesWatch = watch('grades') || [];

  const [subjectInput, setSubjectInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<Array<{ grade: string; subject: string; price: number }>>([]);

  const [updateTeacherDetails] = useUpdateTeacherDetailsMutation();

  // Set initial values from auth store
  useEffect(() => {
    if (authUser) {
      setValue('primaryContact', authUser.mobile);
      setValue('currentSchool', authUser.schoolName);
      setValue('location', authUser.country);
    }
  }, [authUser, setValue]);

  useEffect(() => {
    if (teacherDetails) {
      setValue('teachingExperience', teacherDetails?.data?.teachingExperience || 0);
      setSelectedEntries(
        teacherDetails?.data?.gradesSubjects?.map(({ grade, subject, pricing }) => ({
          grade,
          subject,
          price: pricing,
        })) || []
      );
    }
  }, [teacherDetails, setValue]);

  const addArrayValue = (field: keyof TeacherFormValues, value: string, clear: () => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = (watch(field as any) as string[]) || [];
    if (current.includes(trimmed)) return;
    setValue(field as any, [...current, trimmed], { shouldValidate: true });
    clear();
  };

  const removeArrayValue = (field: keyof TeacherFormValues, index: number) => {
    const current = (watch(field as any) as string[]) || [];
    setValue(field as any, current.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const handleKeyDownAdd = (e: KeyboardEvent<HTMLInputElement>, field: keyof TeacherFormValues, inputVal: string, clear: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArrayValue(field, inputVal, clear);
    }
  };

  const addEntry = () => {
    if (!gradeInput || !subjectInput || !watch('pricing')) return;
    const newEntry = { grade: gradeInput, subject: subjectInput, price: watch('pricing') };
    setSelectedEntries((prev) => [...prev, newEntry]);
    setGradeInput('');
    setSubjectInput('');
    setValue('pricing', 0);
  };

  const deleteEntry = (index: number) => {
    setSelectedEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TeacherFormValues) => {
    try {
      const { teachingExperience } = data;

      // Construct the API payload
      const payload = {
        userId: Number(authUser?.id), // Convert user ID to number
        teachingExperience,
        gradesSubjects: selectedEntries.map(entry => ({
          grade: entry.grade,
          subject: entry.subject,
          pricing: entry.price,
        })),
      };

      await updateTeacherDetails(payload).unwrap();
      toast({
        title: 'Success',
        description: 'Details updated successfully!',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update details.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
    const updateButton = document.activeElement as HTMLElement;
    if (updateButton) {
      updateButton.blur(); // Remove focus from the button to prevent cursor movement
    }
  };

  if (isLoading) {
    return <p>Loading teacher details...</p>;
  }

  console.log('Fetched teacher selectedEntries:', teacherDetails, selectedEntries);

  return (
    <form onSubmit={handleSubmitUpdate} className="p-6 md:p-8 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-purple-800">Update Teacher Details</h2>

      {/* Additional fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            id="location"
            {...register('location')}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.value} value={c.label}>{c.label}</option>
            ))}
          </select>
          {errors.location?.message && <p className="text-sm text-red-600 mt-2">{String(errors.location.message)}</p>}
        </div>

        <div>
          <label htmlFor="teachingExperience" className="block text-sm font-medium text-gray-700 mb-2">Teaching Experience (years)</label>
          <select
            id="teachingExperience"
            {...register('teachingExperience', { valueAsNumber: true })}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {Array.from({ length: 31 }).map((_, i) => (
              <option key={i} value={i}>{i === 30 ? '30+' : String(i)}</option>
            ))}
          </select>
          {errors.teachingExperience?.message && <p className="text-sm text-red-600 mt-2">{String(errors.teachingExperience.message)}</p>}
        </div>

        <div>
          <label htmlFor="primaryContact" className="block text-sm font-medium text-gray-700 mb-2">Primary Contact</label>
          <input
            id="primaryContact"
            {...register('primaryContact')}
            type="tel"
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.primaryContact?.message && <p className="text-sm text-red-600 mt-2">{String(errors.primaryContact.message)}</p>}
        </div>

        <div>
          <label htmlFor="currentSchool" className="block text-sm font-medium text-gray-700 mb-2">Current School</label>
          <input
            id="currentSchool"
            {...register('currentSchool')}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.currentSchool?.message && <p className="text-sm text-red-600 mt-2">{String(errors.currentSchool.message)}</p>}
        </div>
      </div>

      {/* Responsive grid for fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 items-center">
        <div>
          <label htmlFor="grades" className="block text-sm font-medium text-gray-700 mb-2">Grades</label>
          <select
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
          <select
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="--">Select</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-2">Pricing (per hour)</label>
          <input
            id="pricing"
            {...register('pricing', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addEntry}
            className="px-4 py-2 bg-purple-600 text-white rounded-full"
          >
            Add
          </button>
        </div>
      </div>

      {/* Table to display selected entries */}
      {selectedEntries.length > 0 && (
        <div className="mt-6">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Grade</th>
                <th className="border border-gray-300 px-4 py-2">Subject</th>
                <th className="border border-gray-300 px-4 py-2">Pricing</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedEntries.map((entry, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{entry.grade}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.subject}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.price}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => deleteEntry(index)}
                      className="text-red-600 hover:underline flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit and Cancel buttons */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Update Details
        </button>
        <button
          type="button"
          onClick={() => {
            reset(defaultValues);
            setSubjectInput('');
            setGradeInput('');
            setSelectedEntries([]);
          }}
          className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TeacherDetailsForm;