import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveKehamilanList, useKehamilanList, useGugurKehamilan, useUpdateKehamilan, useDeleteKehamilan } from '@/hooks/useKehamilan';
import { useYearStore } from '@/stores/yearStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Baby,
  Edit2,
  Trash2,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';

export default function KehamilanListScreen() {
  const router = useRouter();
  const { activeYear, setActiveYear } = useYearStore();
  const { isKader, user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat'>('aktif');
  
  const { data: activeList, isLoading: isActiveLoading, refetch: refetchActive } = useActiveKehamilanList();
  const { data: historyList, isLoading: isHistoryLoading, refetch: refetchHistory } = useKehamilanList(activeYear);
  const gugurKehamilan = useGugurKehamilan();
  const updateKehamilan = useUpdateKehamilan();
  const deleteKehamilan = useDeleteKehamilan();

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedWargaName, setSelectedWargaName] = useState('');
  const [form, setForm] = useState({
    tanggal_mutasi: '',
    hpht: '',
    hpl: '',
    bb_awal: '',
    tinggi_badan: '',
    jarak_pernikahan_tahun: '',
    jarak_pernikahan_bulan: '',
    golongan_darah: 'O',
    alergi: '',
    no_jkn: '',
    faskes: '',
    pendidikan: '',
    catatan: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<'tanggal_mutasi' | 'hpht' | 'hpl' | null>(null);

  const handleRefetch = () => {
    if (activeTab === 'aktif') refetchActive();
    else refetchHistory();
  };

  const handleGugurKandungan = (warga: any) => {
    Alert.alert(
      'Gugur Kandungan',
      `Apakah Anda yakin ingin mencatat peristiwa gugur kandungan untuk ibu ${warga.nama_lengkap}? Tindakan ini akan menonaktifkan status kehamilan aktif.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Catat Peristiwa',
          style: 'destructive',
          onPress: async () => {
            try {
              await gugurKehamilan.mutateAsync({
                warga_id: warga.id,
                tanggal_mutasi: new Date().toISOString().split('T')[0],
                keterangan: 'Gugur Kandungan'
              });
              Alert.alert('Sukses', 'Peristiwa gugur kandungan berhasil dicatat.');
              refetchActive();
              refetchHistory();
            } catch (err: any) {
              Alert.alert('Gagal', err.message || 'Gagal menyimpan data.');
            }
          }
        }
      ]
    );
  };

  const handleEditPress = (record: any, namaWarga: string) => {
    setSelectedRecord(record);
    setSelectedWargaName(namaWarga);
    
    let details: any = {};
    if (record.keterangan) {
      try {
        if (record.keterangan.startsWith('{')) {
          details = JSON.parse(record.keterangan);
        }
      } catch (e) {
        // ignore
      }
    }
    
    setForm({
      tanggal_mutasi: record.tanggal_mutasi || new Date().toISOString().split('T')[0],
      hpht: record.hpht || new Date().toISOString().split('T')[0],
      hpl: record.hpl || '',
      bb_awal: details.bb_awal ? String(details.bb_awal) : '',
      tinggi_badan: details.tinggi_badan ? String(details.tinggi_badan) : '',
      jarak_pernikahan_tahun: details.jarak_pernikahan_tahun ? String(details.jarak_pernikahan_tahun) : '',
      jarak_pernikahan_bulan: details.jarak_pernikahan_bulan ? String(details.jarak_pernikahan_bulan) : '',
      golongan_darah: details.golongan_darah || 'O',
      alergi: details.alergi || '',
      no_jkn: details.no_jkn || '',
      faskes: details.faskes || '',
      pendidikan: details.pendidikan || '',
      catatan: details.catatan || ''
    });
    setEditModalVisible(true);
  };

  const handleEditActive = async (warga: any) => {
    // Find active pregnancy record in mutasi_penduduk
    const { data, error } = await supabase
      .from('mutasi_penduduk')
      .select('*')
      .eq('warga_id', warga.id)
      .eq('jenis_mutasi', 'kehamilan')
      .eq('status_kehamilan', 'hamil')
      .order('tanggal_mutasi', { ascending: false })
      .limit(1);
    
    if (error) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
      return;
    }

    if (!data || data.length === 0) {
      // Legacy fallback: Create a default mutasi record so it can be edited
      const todayStr = new Date().toISOString().split('T')[0];
      const hplStr = new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: newRecord, error: insertError } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: warga.id,
          rt_id: warga.rt_id,
          jenis_mutasi: 'kehamilan',
          status_kehamilan: 'hamil',
          tanggal_mutasi: todayStr,
          hpht: todayStr,
          hpl: hplStr,
          keterangan: JSON.stringify({ catatan: 'Legacy record' }),
          created_by: user?.id
        }])
        .select()
        .single();

      if (insertError) {
        Alert.alert('Gagal', 'Gagal menginisialisasi data kehamilan: ' + insertError.message);
        return;
      }
      
      handleEditPress(newRecord, warga.nama_lengkap);
    } else {
      handleEditPress(data[0], warga.nama_lengkap);
    }
  };

  const handleDeletePress = (record: any, warga: any) => {
    Alert.alert(
      'Hapus Laporan Kehamilan',
      `Apakah Anda yakin ingin menghapus data kehamilan untuk ${warga?.nama_lengkap || 'warga'}? Status kehamilan akan dinonaktifkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteKehamilan.mutateAsync({ id: record.id, warga_id: record.warga_id });
              Alert.alert('Sukses', 'Laporan kehamilan berhasil dihapus.');
              refetchActive();
              refetchHistory();
            } catch (e: any) {
              Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteActive = async (warga: any) => {
    const { data, error } = await supabase
      .from('mutasi_penduduk')
      .select('*')
      .eq('warga_id', warga.id)
      .eq('jenis_mutasi', 'kehamilan')
      .eq('status_kehamilan', 'hamil')
      .order('tanggal_mutasi', { ascending: false })
      .limit(1);
    
    if (!error && data && data.length > 0) {
      handleDeletePress(data[0], warga);
    } else {
      Alert.alert(
        'Revert Status Kehamilan',
        `Apakah Anda yakin ingin menonaktifkan status kehamilan untuk ${warga.nama_lengkap}?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Revert',
            style: 'destructive',
            onPress: async () => {
              await supabase.from('wargas').update({ status_kehamilan: false }).eq('id', warga.id);
              refetchActive();
            }
          }
        ]
      );
    }
  };

  const handleUpdate = async () => {
    const details = {
      bb_awal: form.bb_awal,
      tinggi_badan: form.tinggi_badan,
      jarak_pernikahan_tahun: form.jarak_pernikahan_tahun,
      jarak_pernikahan_bulan: form.jarak_pernikahan_bulan,
      golongan_darah: form.golongan_darah,
      alergi: form.alergi,
      no_jkn: form.no_jkn,
      faskes: form.faskes,
      pendidikan: form.pendidikan,
      catatan: form.catatan
    };

    try {
      await updateKehamilan.mutateAsync({
        id: selectedRecord.id,
        tanggal_mutasi: form.tanggal_mutasi,
        hpht: form.hpht,
        hpl: form.hpl,
        keterangan: JSON.stringify(details)
      });
      Alert.alert('Sukses', 'Data kehamilan berhasil diperbarui.');
      setEditModalVisible(false);
      refetchActive();
      refetchHistory();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
    }
  };

  const openDatePicker = (field: 'tanggal_mutasi' | 'hpht' | 'hpl') => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    setForm(prev => {
      const updated = { ...prev };
      if (dateField === 'tanggal_mutasi') {
        updated.tanggal_mutasi = formattedDate;
      } else if (dateField === 'hpht') {
        updated.hpht = formattedDate;
        const hplDate = new Date(selectedDate);
        hplDate.setDate(hplDate.getDate() + 280);
        updated.hpl = hplDate.toISOString().split('T')[0];
      } else if (dateField === 'hpl') {
        updated.hpl = formattedDate;
      }
      return updated;
    });
    
    setDateField(null);
  };

  const getUsiaKehamilan = (hphtStr?: string) => {
    if (!hphtStr) return '-';
    const hpht = new Date(hphtStr);
    const diffMs = new Date().getTime() - hpht.getTime();
    const diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHari < 0) return 'Belum dimulai';
    return `${Math.floor(diffHari / 7)} minggu ${diffHari % 7} hari`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1E293B" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Data Kehamilan</Text>
          <TouchableOpacity 
            onPress={() => router.push('/kehamilan/tambah' as any)}
            style={styles.addButton}
          >
            <Plus color="#fff" size={16} />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Pemantauan data ibu hamil dan kehamilan padukuhan</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'aktif' && styles.tabBtnActive]}
          onPress={() => setActiveTab('aktif')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'aktif' && styles.tabBtnTextActive]}>Ibu Hamil Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]}
          onPress={() => setActiveTab('riwayat')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'riwayat' && styles.tabBtnTextActive]}>Riwayat Laporan</Text>
        </TouchableOpacity>
      </View>

      {/* Year Switcher (Only visible for Riwayat tab) */}
      {activeTab === 'riwayat' && (
        <View style={styles.yearSwitcher}>
          <TouchableOpacity 
            style={styles.yearChangeBtn}
            onPress={() => setActiveYear(activeYear - 1)}
          >
            <ChevronLeft size={18} color="#475569" />
          </TouchableOpacity>
          <View style={styles.yearDisplay}>
            <CalendarIcon size={14} color="#124170" style={{ marginRight: 6 }} />
            <Text style={styles.yearText}>Tahun Laporan: {activeYear}</Text>
          </View>
          <TouchableOpacity 
            style={styles.yearChangeBtn}
            onPress={() => setActiveYear(activeYear + 1)}
          >
            <ChevronRight size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefetch} tintColor="#124170" />}
      >
        {activeTab === 'aktif' ? (
          isActiveLoading ? (
            <ActivityIndicator color="#124170" size="large" style={{ marginTop: 24 }} />
          ) : !activeList || activeList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Heart size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>Tidak Ada Ibu Hamil Aktif</Text>
              <Text style={styles.emptySubtext}>Saat ini tidak ada warga dengan status kehamilan aktif.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 24 }}>
              {activeList.map((warga: any) => (
                <View key={warga.id} style={styles.listItemRow}>
                  <View style={styles.iconWrapper}>
                    <Heart size={16} color="#D53F8C" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{warga.nama_lengkap}</Text>
                    <Text style={styles.itemMeta}>NIK: {warga.nik || '-'} • RT {warga.rts?.nomor_rt || '-'}</Text>
                    
                    {/* Alamat */}
                    {warga.rumah_tanggas?.alamat_detail && (
                      <Text style={styles.itemAddress}>{warga.rumah_tanggas.alamat_detail}</Text>
                    )}

                    {/* Action buttons */}
                    <View style={styles.rowActions}>
                      <TouchableOpacity 
                        style={styles.melahirkanBtn} 
                        onPress={() => router.push({
                          pathname: '/kelahiran/tambah',
                          params: {
                            ibuId: warga.id,
                            ibuNama: warga.nama_lengkap,
                            rumahTanggaId: warga.rumah_tangga_id || '',
                            rtId: warga.rt_id || ''
                          }
                        })}
                      >
                        <Baby size={14} color="#124170" style={{ marginRight: 4 }} />
                        <Text style={styles.melahirkanBtnText}>Melahirkan</Text>
                      </TouchableOpacity>
                      <View style={{ width: 8 }} />
                      <TouchableOpacity 
                        style={styles.gugurBtn} 
                        onPress={() => handleGugurKandungan(warga)}
                      >
                        <ShieldAlert size={14} color="#EF4444" style={{ marginRight: 4 }} />
                        <Text style={styles.gugurBtnText}>Gugur Kandungan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {!isKader() && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => handleEditActive(warga)} style={styles.actionBtn}>
                        <Edit2 size={14} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteActive(warga)} style={styles.actionBtn}>
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )
        ) : (
          isHistoryLoading ? (
            <ActivityIndicator color="#124170" size="large" style={{ marginTop: 24 }} />
          ) : !historyList || historyList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <CalendarIcon size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>Tidak Ada Riwayat Laporan</Text>
              <Text style={styles.emptySubtext}>Belum ada riwayat laporan kehamilan untuk tahun {activeYear}.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 24 }}>
              {historyList.map((item: any) => (
                <View key={item.id} style={styles.listItemRow}>
                  <View style={[styles.iconWrapper, { backgroundColor: item.status_kehamilan === 'melahirkan' ? '#EFF6FF' : item.status_kehamilan === 'gugur' ? '#FEE2E2' : '#FCE7F3' }]}>
                    <Heart size={16} color={item.status_kehamilan === 'melahirkan' ? '#124170' : item.status_kehamilan === 'gugur' ? '#EF4444' : '#D53F8C'} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.wargas?.nama_lengkap || 'Warga'}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={[styles.statusBadgeText, { color: statusColors(item.status_kehamilan) }]}>
                        {item.status_kehamilan === 'hamil' ? 'Mulai Hamil' : item.status_kehamilan === 'melahirkan' ? 'Melahirkan' : item.status_kehamilan === 'gugur' ? 'Keguguran' : item.status_kehamilan}
                      </Text>
                      <Text style={styles.dividerDot}>•</Text>
                      <Text style={styles.itemDate}>
                        {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: localeId })}
                      </Text>
                    </View>
                    
                    {item.hpht && (
                      <Text style={styles.itemDetails}>HPHT: {format(new Date(item.hpht), 'dd MMM yyyy', { locale: localeId })} {item.status_kehamilan === 'hamil' && `(Usia: ${getUsiaKehamilan(item.hpht)})`}</Text>
                    )}
                    {item.hpl && item.status_kehamilan === 'hamil' && (
                      <Text style={styles.itemDetails}>Estimasi Lahir (HPL): {format(new Date(item.hpl), 'dd MMM yyyy', { locale: localeId })}</Text>
                    )}
                    {item.keterangan && !item.keterangan.startsWith('{') && (
                      <Text style={styles.itemNote}>"{item.keterangan}"</Text>
                    )}
                  </View>
                  
                  {!isKader() && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => handleEditPress(item, item.wargas?.nama_lengkap || 'Warga')} style={styles.actionBtn}>
                        <Edit2 size={14} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeletePress(item, item.wargas)} style={styles.actionBtn}>
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Kehamilan Ibu</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalSubtitle}>Ibu: {selectedWargaName}</Text>
              
              {/* Tanggal Mulai Kehamilan */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>TANGGAL LAPORAN/MUTASI *</Text>
                <TouchableOpacity onPress={() => openDatePicker('tanggal_mutasi')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.tanggal_mutasi}</Text>
                </TouchableOpacity>
              </View>

              {/* Tanggal HPHT */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>HARI PERTAMA HAID TERAKHIR (HPHT) *</Text>
                <TouchableOpacity onPress={() => openDatePicker('hpht')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.hpht}</Text>
                </TouchableOpacity>
              </View>

              {/* Estimasi Lahir HPL */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>ESTIMASI LAHIR (HPL) *</Text>
                <TouchableOpacity onPress={() => openDatePicker('hpl')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.hpl}</Text>
                </TouchableOpacity>
              </View>

              {/* BB Awal & TB */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>BB AWAL (KG)</Text>
                  <TextInput 
                    placeholder="Contoh: 52" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.bb_awal} 
                    onChangeText={(val) => setForm({ ...form, bb_awal: val })} 
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>TINGGI BADAN (CM)</Text>
                  <TextInput 
                    placeholder="Contoh: 158" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.tinggi_badan} 
                    onChangeText={(val) => setForm({ ...form, tinggi_badan: val })} 
                  />
                </View>
              </View>

              {/* Jarak Pernikahan */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>JARAK PERNIKAHAN DENGAN KEHAMILAN</Text>
                <View style={styles.row}>
                  <View style={styles.half}>
                    <TextInput 
                      placeholder="Tahun" 
                      keyboardType="numeric"
                      style={styles.textInput} 
                      value={form.jarak_pernikahan_tahun} 
                      onChangeText={(val) => setForm({ ...form, jarak_pernikahan_tahun: val })} 
                    />
                  </View>
                  <View style={styles.half}>
                    <TextInput 
                      placeholder="Bulan" 
                      keyboardType="numeric"
                      style={styles.textInput} 
                      value={form.jarak_pernikahan_bulan} 
                      onChangeText={(val) => setForm({ ...form, jarak_pernikahan_bulan: val })} 
                    />
                  </View>
                </View>
              </View>

              {/* Golongan Darah */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>GOLONGAN DARAH</Text>
                <View style={styles.selectRow}>
                  {['A', 'B', 'AB', 'O', 'Tidak Tahu'].map((gol) => (
                    <TouchableOpacity 
                      key={gol} 
                      style={[styles.selectOption, form.golongan_darah === gol && styles.selectOptionActive]}
                      onPress={() => setForm({ ...form, golongan_darah: gol })}
                    >
                      <Text style={[styles.selectOptionText, form.golongan_darah === gol && styles.selectOptionTextActive]}>
                        {gol}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Alergi */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>ALERGI (JIKA ADA)</Text>
                <TextInput 
                  placeholder="Contoh: Alergi udang, penisilin" 
                  style={styles.textInput} 
                  value={form.alergi} 
                  onChangeText={(val) => setForm({ ...form, alergi: val })} 
                />
              </View>

              {/* JKN & Faskes */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>NO. JKN / BPJS</Text>
                  <TextInput 
                    placeholder="Nomer" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.no_jkn} 
                    onChangeText={(val) => setForm({ ...form, no_jkn: val })} 
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>FASKES RUJUKAN</Text>
                  <TextInput 
                    placeholder="Puskesmas" 
                    style={styles.textInput} 
                    value={form.faskes} 
                    onChangeText={(val) => setForm({ ...form, faskes: val })} 
                  />
                </View>
              </View>

              {/* Pendidikan */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>PENDIDIKAN IBU</Text>
                <TextInput 
                  placeholder="SD, SMP, SMA, S1, dll." 
                  style={styles.textInput} 
                  value={form.pendidikan} 
                  onChangeText={(val) => setForm({ ...form, pendidikan: val })} 
                />
              </View>

              {/* Catatan */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>CATATAN TAMBAHAN</Text>
                <TextInput 
                  placeholder="Catatan kehamilan..." 
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                  multiline 
                  value={form.catatan} 
                  onChangeText={(val) => setForm({ ...form, catatan: val })} 
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveConfirmBtn, updateKehamilan.isPending && { opacity: 0.6 }]} 
                onPress={handleUpdate}
                disabled={updateKehamilan.isPending}
              >
                {updateKehamilan.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveConfirmBtnText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker 
          value={
            dateField === 'hpht' && form.hpht 
              ? new Date(form.hpht) 
              : dateField === 'hpl' && form.hpl 
                ? new Date(form.hpl) 
                : form.tanggal_mutasi 
                  ? new Date(form.tanggal_mutasi)
                  : new Date()
          } 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={handleDateChange} 
          maximumDate={dateField === 'hpl' ? undefined : new Date()} 
        />
      )}
    </SafeAreaView>
  );
}

const statusColors = (status: string) => {
  if (status === 'melahirkan') return '#124170';
  if (status === 'gugur') return '#B91C1C';
  return '#BE185D';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#124170',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  yearSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  yearChangeBtn: {
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listItemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  gugurBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  gugurBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  melahirkanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  melahirkanBtnText: {
    fontSize: 11,
    color: '#124170',
    fontWeight: '600',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dividerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
  },
  itemDetails: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Modal styles
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  dateSelectorText: {
    fontSize: 13,
    color: '#334155',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectOptionActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#475569',
  },
  selectOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  saveConfirmBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#124170',
    alignItems: 'center',
    marginTop: 16,
  },
  saveConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
