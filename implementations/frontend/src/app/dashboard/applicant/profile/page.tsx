'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  skills: string;
  experience: string;
  education: string;
  preferredLocation: string;
  resumeUrl: string;
}

interface PaymentForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export default function ApplicantProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [verifyModal, setVerifyModal] = useState(false);
  const [citizenId, setCitizenId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [payModal, setPayModal] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState<PaymentForm>({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      skills: user?.applicantProfile?.skills?.join(', ') ?? '',
      experience: user?.applicantProfile?.experience ?? '',
      education: user?.applicantProfile?.education ?? '',
      preferredLocation: user?.applicantProfile?.preferredLocation ?? '',
      resumeUrl: user?.applicantProfile?.resumeUrl ?? '',
    },
  });

  const onSave = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await api.put('/users/profile', {
        ...data,
        skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSaveMsg('Profile saved successfully');
    } catch (err) {
      setSaveMsg(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleInitiatePayment = async () => {
    try {
      const res = await api.post<ApiResponse<{ payment: { id: string } }>>('/payments/initiate');
      setPaymentId(res.data.data.payment.id);
      setPayModal(true);
    } catch (err) {
      setPayMsg(getApiErrorMessage(err));
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentId) return;
    setPaying(true);
    setPayMsg(null);
    try {
      await api.post('/payments/confirm', {
        paymentId,
        cardNumber: payForm.cardNumber,
        expiryMonth: Number.parseInt(payForm.expiryMonth, 10),
        expiryYear: Number.parseInt(payForm.expiryYear, 10),
        cvv: payForm.cvv,
      });
      setPayModal(false);
      setPayMsg('Payment successful!');
      if (user) updateUser({ ...user, isPaid: true });
    } catch (err) {
      setPayMsg(getApiErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyMsg(null);
    try {
      const res = await api.post<ApiResponse<{ status: string; message: string }>>('/verifications/verify-id', { citizenId });
      const success = res.data.data.status === 'VERIFIED';
      setVerifyMsg({ success, text: res.data.data.message });
      if (success && user) updateUser({ ...user, isVerified: true });
    } catch (err) {
      setVerifyMsg({ success: false, text: getApiErrorMessage(err) });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and account settings</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-2xl p-4 border ${user?.isPaid ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {user?.isPaid ? <CheckCircle className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4 text-orange-500" />}
            <span className="font-semibold text-sm">{user?.isPaid ? 'Payment Complete' : 'Payment Required'}</span>
          </div>
          {!user?.isPaid && (
            <Button size="sm" onClick={handleInitiatePayment} className="mt-2 w-full">Pay 500 THB</Button>
          )}
          {payMsg && <p className="text-xs mt-1 text-green-700">{payMsg}</p>}
        </div>

        <div className={`rounded-2xl p-4 border ${user?.isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {user?.isVerified
              ? <CheckCircle className="w-4 h-4 text-green-600" />
              : <ShieldCheck className="w-4 h-4 text-yellow-500" />
            }
            <span className="font-semibold text-sm">{user?.isVerified ? 'ID Verified' : 'Not Verified'}</span>
          </div>
          {!user?.isVerified && (
            <Button size="sm" variant="outline" onClick={() => setVerifyModal(true)} className="mt-2 w-full">Verify ID</Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" {...register('firstName')} />
            <Input label="Last Name" {...register('lastName')} />
          </div>
          <Input label="Phone" {...register('phone')} />
          <Input label="Resume URL" placeholder="https://..." {...register('resumeUrl')} />
          <Input label="Skills (comma separated)" placeholder="React, TypeScript, Node.js" {...register('skills')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <textarea rows={3} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('experience')} />
          </div>
          <Input label="Education" {...register('education')} />
          <Input label="Preferred Location" {...register('preferredLocation')} />
          {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
          <Button type="submit" isLoading={saving}>Save Profile</Button>
        </form>
      </div>

      {/* Verify ID Modal */}
      <Modal isOpen={verifyModal} onClose={() => setVerifyModal(false)} title="Verify Thai Citizen ID">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter your 13-digit Thai National ID number for verification.</p>
          <Input
            label="Thai Citizen ID"
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
            placeholder="0000000000000"
            maxLength={13}
          />
          {verifyMsg && (
            <div className={`flex items-center gap-2 text-sm ${verifyMsg.success ? 'text-green-600' : 'text-red-600'}`}>
              {verifyMsg.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {verifyMsg.text}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleVerify} isLoading={verifying} disabled={citizenId.length !== 13} className="flex-1">
              Verify ID
            </Button>
            <Button variant="ghost" onClick={() => setVerifyModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Pay Registration Fee (500 THB)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter your payment card details. Card ending in 0000 will be declined (test).</p>
          <Input
            label="Card Number"
            value={payForm.cardNumber}
            onChange={(e) => setPayForm({ ...payForm, cardNumber: e.target.value })}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Month" type="number" value={payForm.expiryMonth} onChange={(e) => setPayForm({ ...payForm, expiryMonth: e.target.value })} placeholder="MM" />
            <Input label="Year" type="number" value={payForm.expiryYear} onChange={(e) => setPayForm({ ...payForm, expiryYear: e.target.value })} placeholder="YYYY" />
            <Input label="CVV" type="password" value={payForm.cvv} onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value })} placeholder="123" maxLength={3} />
          </div>
          {payMsg && <p className="text-sm text-red-600">{payMsg}</p>}
          <div className="flex gap-2">
            <Button onClick={handleConfirmPayment} isLoading={paying} className="flex-1">Pay 500 THB</Button>
            <Button variant="ghost" onClick={() => setPayModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
