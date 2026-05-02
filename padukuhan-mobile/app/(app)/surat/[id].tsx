import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSuratDetail, useUpdateSuratStatus } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Share2,
  Printer,
  Calendar,
  User,
  Info,
  ShieldCheck,
  Smartphone
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatTanggal } from '@/lib/format';
import { generateSuratPDF, bagikanPDF } from '@/lib/pdf';

export default function SuratDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: item, isLoading, refetch } = useSuratDetail(id as string);
  const updateStatus = useUpdateSuratStatus();
  const { profile } = useAuthStore();

  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (processing) return;
    
    Alert.alert(
      "Konfirmasi Persetujuan",
      "Apakah Anda yakin ingin menyetujui pengajuan surat ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Setujui", 
          onPress: async () => {
            setProcessing(true);
            try {
              // 1. Update status di database
              const nomorSurat = `${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}/RT-${profile?.rt_id?.slice(0,2)}/${new Date().getFullYear()}`;
              
              await updateStatus.mutateAsync({
                id,
                status: 'approved',
                nomor_surat: nomorSurat,
                tanggal_surat: new Date().toISOString().split('T')[0]
              });

              Alert.alert("Berhasil", "Surat telah disetujui. Silakan cetak atau bagikan.");
              refetch();
            } catch (err: any) {
              Alert.alert("Gagal", err.message || "Gagal menyetujui surat.");
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handlePrint = async () => {
    if (!item || item.status !== 'approved') return;
    
    try {
      setProcessing(true);
      const uri = await generateSuratPDF({
        warga: item.wargas,
        rt: {
          nomor_rt: item.wargas?.rts?.nomor_rt,
          nama_lengkap: profile?.nama_lengkap
        },
        keperluan: item.keperluan || 'Keperluan administrasi',
        nomorSurat: item.nomor_surat,
        tanggalSurat: item.tanggal_surat || new Date().toISOString()
      });
      
      await bagikanPDF(uri);
    } catch (err: any) {
      Alert.alert("Gagal Cetak", err.message || "Gagal membuat file PDF.");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator color="#1E3A8A" size="large" />
    </SafeAreaView>
  );

  if (!item) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="font-bold text-slate-400">Data tidak ditemukan.</Text>
    </SafeAreaView>
  );

  const isPending = item.status === 'pending';
  const isApproved = item.status === 'approved' || item.status === 'selesai';

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 pt-6 pb-10 border-b border-slate-100 rounded-b-[40px] shadow-sm">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <ArrowLeft color="#64748B" size={20} />
            </TouchableOpacity>
            <Text className="text-lg font-black text-slate-900">Verifikasi Surat</Text>
            <View className="w-11" />
          </View>

          <View className="bg-blue-50 self-start px-4 py-1.5 rounded-full mb-4 border border-blue-100/50">
            <Text className="text-blue-600 text-[9px] font-black uppercase tracking-widest">{item.jenis_surat?.replace('_', ' ')}</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">{item.wargas?.nama_lengkap}</Text>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">NIK: {item.wargas?.nik}</Text>
        </View>

        <View className="px-6 py-8 space-y-8">
          {/* Detail Info */}
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detail Pengajuan</Text>
            <View className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-200/30 space-y-6">
              <DetailRow label="Keperluan" value={item.keperluan} icon={<Info size={16} color="#64748B" />} />
              <DetailRow label="Tanggal Pengajuan" value={formatTanggal(item.created_at)} icon={<Calendar size={16} color="#64748B" />} />
              <DetailRow label="Diajukan Via" value={item.diajukan_via === 'pwa' ? 'Portal Warga (PWA)' : 'Input RT'} icon={<Smartphone size={16} color="#64748B" />} />
            </View>
          </View>

          {/* Status Section */}
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Status & Tindakan</Text>
            <View className={`p-8 rounded-[40px] shadow-2xl ${isApproved ? 'bg-emerald-600 shadow-emerald-900/30' : isPending ? 'bg-slate-900 shadow-slate-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Status Pengajuan</Text>
                  <Text className="text-white font-bold text-lg">{item.status.toUpperCase()}</Text>
                </View>
                <View className="bg-white/10 p-3 rounded-2xl">
                  {isApproved ? <ShieldCheck color="white" size={24} /> : <Clock color="white" size={24} />}
                </View>
              </View>

              {isApproved && item.nomor_surat && (
                <View className="bg-white/10 p-4 rounded-2xl mb-6">
                   <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Nomor Surat</Text>
                   <Text className="text-white font-black text-base">{item.nomor_surat}</Text>
                </View>
              )}

              {isPending ? (
                <TouchableOpacity 
                  onPress={handleApprove}
                  disabled={processing}
                  className="bg-white p-5 rounded-3xl items-center"
                >
                  {processing ? <ActivityIndicator color="#1E293B" /> : (
                    <View className="flex-row items-center">
                      <CheckCircle2 size={18} color="#1E293B" />
                      <Text className="text-slate-900 font-black uppercase tracking-widest ml-3">Approve Surat</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : isApproved && (
                <TouchableOpacity 
                  onPress={handlePrint}
                  disabled={processing}
                  className="bg-white p-5 rounded-3xl items-center"
                >
                  {processing ? <ActivityIndicator color="#1E293B" /> : (
                    <View className="flex-row items-center">
                      <Printer size={18} color="#1E293B" />
                      <Text className="text-slate-900 font-black uppercase tracking-widest ml-3">Cetak & Bagikan</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <View className="flex-row items-start">
      <View className="bg-slate-50 p-2.5 rounded-xl mr-4 border border-slate-100">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</Text>
        <Text className="text-slate-700 font-bold text-sm leading-5">{value || '-'}</Text>
      </View>
    </View>
  );
}
