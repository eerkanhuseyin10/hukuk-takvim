/* Sekreter renderer: 02-catalogs-forms.js */
const MAHKEMELER = [
  // ── BALIKESİR CEZA MAHKEMELERİ ──
  "Balıkesir 1. Ağır Ceza Mahkemesi","Balıkesir 2. Ağır Ceza Mahkemesi",
  "Balıkesir 3. Ağır Ceza Mahkemesi","Balıkesir 4. Ağır Ceza Mahkemesi",
  "Balıkesir 1. Asliye Ceza Mahkemesi","Balıkesir 2. Asliye Ceza Mahkemesi",
  "Balıkesir 3. Asliye Ceza Mahkemesi","Balıkesir 4. Asliye Ceza Mahkemesi",
  "Balıkesir 5. Asliye Ceza Mahkemesi","Balıkesir 6. Asliye Ceza Mahkemesi",
  "Balıkesir 7. Asliye Ceza Mahkemesi","Balıkesir 8. Asliye Ceza Mahkemesi",
  "Balıkesir 9. Asliye Ceza Mahkemesi",
  "Balıkesir Çocuk Mahkemesi","Balıkesir Çocuk Ağır Ceza Mahkemesi",
  "Balıkesir İnfaz Hâkimliği",
  "Balıkesir 1. Sulh Ceza Hâkimliği","Balıkesir 2. Sulh Ceza Hâkimliği",
  // ── BALIKESİR HUKUK MAHKEMELERİ ──
  "Balıkesir 1. Asliye Hukuk Mahkemesi","Balıkesir 2. Asliye Hukuk Mahkemesi",
  "Balıkesir 3. Asliye Hukuk Mahkemesi","Balıkesir 4. Asliye Hukuk Mahkemesi",
  "Balıkesir 5. Asliye Hukuk Mahkemesi",
  "Balıkesir Asliye Ticaret Mahkemesi",
  "Balıkesir 1. Sulh Hukuk Mahkemesi","Balıkesir 2. Sulh Hukuk Mahkemesi",
  "Balıkesir 3. Sulh Hukuk Mahkemesi",
  "Balıkesir 1. Aile Mahkemesi","Balıkesir 2. Aile Mahkemesi","Balıkesir 3. Aile Mahkemesi",
  "Balıkesir 1. İş Mahkemesi","Balıkesir 2. İş Mahkemesi",
  "Balıkesir 1. İcra Hukuk Mahkemesi","Balıkesir 2. İcra Hukuk Mahkemesi",
  "Balıkesir Kadastro Mahkemesi","Balıkesir Tüketici Mahkemesi",
  "Balıkesir İdare Mahkemesi","Balıkesir Vergi Mahkemesi",
  // ── BALIKESİR DİĞER ──
  "Balıkesir Cumhuriyet Başsavcılığı",
  "Balıkesir İcra Müdürlüğü",
  "Balıkesir Arabuluculuk Merkezi",
  "Balıkesir Bölge Adliye Mahkemesi",
  "Balıkesir Bölge İdare Mahkemesi",
  // ── SAVAŞTEPE ──
  "Savaştepe Asliye Hukuk Mahkemesi","Savaştepe Asliye Ceza Mahkemesi",
  "Savaştepe Sulh Hukuk Mahkemesi","Savaştepe Sulh Ceza Mahkemesi",
  "Savaştepe İcra Hukuk Mahkemesi","Savaştepe İcra Ceza Mahkemesi",
  "Savaştepe Cumhuriyet Başsavcılığı","Savaştepe İcra Müdürlüğü",
  "Savaştepe Emniyet Müdürlüğü","Savaştepe Jandarma Komutanlığı",
  // ── BALIKESİR İLÇE ADLİYELERİ ──
  "Bandırma Ağır Ceza Mahkemesi","Bandırma Asliye Ceza Mahkemesi",
  "Bandırma Asliye Hukuk Mahkemesi","Bandırma Aile Mahkemesi","Bandırma İş Mahkemesi",
  "Bandırma Cumhuriyet Başsavcılığı","Bandırma İcra Müdürlüğü",
  "Edremit Ağır Ceza Mahkemesi","Edremit Asliye Ceza Mahkemesi",
  "Edremit Asliye Hukuk Mahkemesi","Edremit Cumhuriyet Başsavcılığı",
  "Burhaniye Asliye Hukuk Mahkemesi","Burhaniye Asliye Ceza Mahkemesi",
  "Gönen Asliye Hukuk Mahkemesi","Gönen Asliye Ceza Mahkemesi",
  "Erdek Asliye Hukuk Mahkemesi",
  "Manyas Asliye Hukuk Mahkemesi",
  "Sındırgı Asliye Hukuk Mahkemesi","Sındırgı Asliye Ceza Mahkemesi",
  "Susurluk Asliye Hukuk Mahkemesi","Susurluk Asliye Ceza Mahkemesi",
  "Bigadiç Asliye Hukuk Mahkemesi","Bigadiç Asliye Ceza Mahkemesi",
  "Dursunbey Asliye Hukuk Mahkemesi","Dursunbey Asliye Ceza Mahkemesi",
  "İvrindi Asliye Hukuk Mahkemesi","İvrindi Asliye Ceza Mahkemesi",
  "Kepsut Asliye Hukuk Mahkemesi","Kepsut Asliye Ceza Mahkemesi",
  // ── İZMİR CEZA MAHKEMELERİ ──
  "İzmir 1. Ağır Ceza Mahkemesi",
  "İzmir 2. Ağır Ceza Mahkemesi",
  "İzmir 3. Ağır Ceza Mahkemesi",
  "İzmir 4. Ağır Ceza Mahkemesi",
  "İzmir 5. Ağır Ceza Mahkemesi",
  "İzmir 6. Ağır Ceza Mahkemesi",
  "İzmir 7. Ağır Ceza Mahkemesi",
  "İzmir 8. Ağır Ceza Mahkemesi",
  "İzmir 9. Ağır Ceza Mahkemesi",
  "İzmir 10. Ağır Ceza Mahkemesi",
  "İzmir 11. Ağır Ceza Mahkemesi",
  "İzmir 12. Ağır Ceza Mahkemesi",
  "İzmir 13. Ağır Ceza Mahkemesi",
  "İzmir 14. Ağır Ceza Mahkemesi",
  "İzmir 15. Ağır Ceza Mahkemesi",
  "İzmir 16. Ağır Ceza Mahkemesi",
  "İzmir 17. Ağır Ceza Mahkemesi",
  "İzmir 18. Ağır Ceza Mahkemesi",
  "İzmir 19. Ağır Ceza Mahkemesi",
  "İzmir 20. Ağır Ceza Mahkemesi",
  "İzmir 21. Ağır Ceza Mahkemesi",
  "İzmir 22. Ağır Ceza Mahkemesi",
  "İzmir 23. Ağır Ceza Mahkemesi",
  "İzmir 1. Asliye Ceza Mahkemesi",
  "İzmir 2. Asliye Ceza Mahkemesi",
  "İzmir 3. Asliye Ceza Mahkemesi",
  "İzmir 4. Asliye Ceza Mahkemesi",
  "İzmir 5. Asliye Ceza Mahkemesi",
  "İzmir 6. Asliye Ceza Mahkemesi",
  "İzmir 7. Asliye Ceza Mahkemesi",
  "İzmir 8. Asliye Ceza Mahkemesi",
  "İzmir 9. Asliye Ceza Mahkemesi",
  "İzmir 10. Asliye Ceza Mahkemesi",
  "İzmir 11. Asliye Ceza Mahkemesi",
  "İzmir 12. Asliye Ceza Mahkemesi",
  "İzmir 13. Asliye Ceza Mahkemesi",
  "İzmir 14. Asliye Ceza Mahkemesi",
  "İzmir 15. Asliye Ceza Mahkemesi",
  "İzmir 16. Asliye Ceza Mahkemesi",
  "İzmir 17. Asliye Ceza Mahkemesi",
  "İzmir 18. Asliye Ceza Mahkemesi",
  "İzmir 19. Asliye Ceza Mahkemesi",
  "İzmir 20. Asliye Ceza Mahkemesi",
  "İzmir 21. Asliye Ceza Mahkemesi",
  "İzmir 22. Asliye Ceza Mahkemesi",
  "İzmir 23. Asliye Ceza Mahkemesi",
  "İzmir 24. Asliye Ceza Mahkemesi",
  "İzmir 25. Asliye Ceza Mahkemesi",
  "İzmir 26. Asliye Ceza Mahkemesi",
  "İzmir 27. Asliye Ceza Mahkemesi",
  "İzmir 28. Asliye Ceza Mahkemesi",
  "İzmir 29. Asliye Ceza Mahkemesi",
  "İzmir 30. Asliye Ceza Mahkemesi",
  "İzmir 31. Asliye Ceza Mahkemesi",
  "İzmir 32. Asliye Ceza Mahkemesi",
  "İzmir 33. Asliye Ceza Mahkemesi",
  "İzmir 34. Asliye Ceza Mahkemesi",
  "İzmir 35. Asliye Ceza Mahkemesi",
  "İzmir 36. Asliye Ceza Mahkemesi",
  "İzmir 37. Asliye Ceza Mahkemesi",
  "İzmir 38. Asliye Ceza Mahkemesi",
  "İzmir 39. Asliye Ceza Mahkemesi",
  "İzmir 40. Asliye Ceza Mahkemesi",
  "İzmir 41. Asliye Ceza Mahkemesi",
  "İzmir 42. Asliye Ceza Mahkemesi",
  "İzmir 43. Asliye Ceza Mahkemesi",
  "İzmir 44. Asliye Ceza Mahkemesi",
  "İzmir 45. Asliye Ceza Mahkemesi",
  "İzmir 46. Asliye Ceza Mahkemesi",
  "İzmir 47. Asliye Ceza Mahkemesi",
  "İzmir 48. Asliye Ceza Mahkemesi",
  "İzmir 49. Asliye Ceza Mahkemesi",
  "İzmir 50. Asliye Ceza Mahkemesi",
  "İzmir 51. Asliye Ceza Mahkemesi",
  "İzmir 52. Asliye Ceza Mahkemesi",
  "İzmir 53. Asliye Ceza Mahkemesi",
  "İzmir 54. Asliye Ceza Mahkemesi",
  "İzmir 55. Asliye Ceza Mahkemesi",
  "İzmir 56. Asliye Ceza Mahkemesi",
  "İzmir 57. Asliye Ceza Mahkemesi",
  "İzmir 58. Asliye Ceza Mahkemesi",
  "İzmir 59. Asliye Ceza Mahkemesi",
  "İzmir 60. Asliye Ceza Mahkemesi",
  "İzmir 61. Asliye Ceza Mahkemesi",
  "İzmir 62. Asliye Ceza Mahkemesi",
  "İzmir 63. Asliye Ceza Mahkemesi",
  "İzmir 1. Çocuk Ağır Ceza Mahkemesi",
  "İzmir 2. Çocuk Ağır Ceza Mahkemesi",
  "İzmir 1. Çocuk Mahkemesi",
  "İzmir 2. Çocuk Mahkemesi",
  "İzmir 3. Çocuk Mahkemesi",
  "İzmir 4. Çocuk Mahkemesi",
  "İzmir 5. Çocuk Mahkemesi",
  // ── İZMİR HUKUK MAHKEMELERİ ──
  "İzmir 1. Asliye Ticaret Mahkemesi",
  "İzmir 2. Asliye Ticaret Mahkemesi",
  "İzmir 3. Asliye Ticaret Mahkemesi",
  "İzmir 4. Asliye Ticaret Mahkemesi",
  "İzmir 5. Asliye Ticaret Mahkemesi",
  "İzmir 6. Asliye Ticaret Mahkemesi",
  "İzmir 7. Asliye Ticaret Mahkemesi",
  "İzmir 1. İcra Hukuk Mahkemesi",
  "İzmir 2. İcra Hukuk Mahkemesi",
  "İzmir 3. İcra Hukuk Mahkemesi",
  "İzmir 4. İcra Hukuk Mahkemesi",
  "İzmir 5. İcra Hukuk Mahkemesi",
  "İzmir 6. İcra Hukuk Mahkemesi",
  "İzmir 7. İcra Hukuk Mahkemesi",
  "İzmir 8. İcra Hukuk Mahkemesi",
  "İzmir 9. İcra Hukuk Mahkemesi",
  "İzmir 10. İcra Hukuk Mahkemesi",
  "İzmir 11. İcra Hukuk Mahkemesi",
  "İzmir 12. İcra Hukuk Mahkemesi",
  "İzmir 13. İcra Hukuk Mahkemesi",
  "İzmir 1. İcra Müdürlüğü",
  "İzmir 2. İcra Müdürlüğü",
  "İzmir 3. İcra Müdürlüğü",
  "İzmir 4. İcra Müdürlüğü",
  "İzmir 5. İcra Müdürlüğü",
  "İzmir 6. İcra Müdürlüğü",
  "İzmir 7. İcra Müdürlüğü",
  "İzmir 8. İcra Müdürlüğü",
  "İzmir 9. İcra Müdürlüğü",
  "İzmir 10. İcra Müdürlüğü",
  "İzmir 11. İcra Müdürlüğü",
  "İzmir 12. İcra Müdürlüğü",
  "İzmir 13. İcra Müdürlüğü",
  "İzmir 14. İcra Müdürlüğü",
  "İzmir 15. İcra Müdürlüğü",
  "İzmir 16. İcra Müdürlüğü",
  "İzmir 17. İcra Müdürlüğü",
  "İzmir 18. İcra Müdürlüğü",
  "İzmir 19. İcra Müdürlüğü",
  "İzmir 20. İcra Müdürlüğü",
  "İzmir 21. İcra Müdürlüğü",
  "İzmir 22. İcra Müdürlüğü",
  "İzmir 23. İcra Müdürlüğü",
  "İzmir 24. İcra Müdürlüğü",
  "İzmir 25. İcra Müdürlüğü",
  "İzmir 26. İcra Müdürlüğü",
  "İzmir 27. İcra Müdürlüğü",
  "İzmir 28. İcra Müdürlüğü",
  "İzmir 1. Sulh Hukuk Mahkemesi",
  "İzmir 2. Sulh Hukuk Mahkemesi",
  "İzmir 3. Sulh Hukuk Mahkemesi",
  "İzmir 4. Sulh Hukuk Mahkemesi",
  "İzmir 5. Sulh Hukuk Mahkemesi",
  "İzmir 6. Sulh Hukuk Mahkemesi",
  "İzmir 7. Sulh Hukuk Mahkemesi",
  "İzmir 8. Sulh Hukuk Mahkemesi",
  "İzmir 9. Sulh Hukuk Mahkemesi",
  "İzmir 10. Sulh Hukuk Mahkemesi",
  "İzmir 11. Sulh Hukuk Mahkemesi",
  "İzmir 12. Sulh Hukuk Mahkemesi",
  "İzmir 13. Sulh Hukuk Mahkemesi",
  "İzmir 14. Sulh Hukuk Mahkemesi",
  "İzmir 15. Sulh Hukuk Mahkemesi",
  "İzmir 16. Sulh Hukuk Mahkemesi",
  "İzmir 17. Sulh Hukuk Mahkemesi",
  "İzmir 18. Sulh Hukuk Mahkemesi",
  "İzmir 19. Sulh Hukuk Mahkemesi",
  "İzmir 20. Sulh Hukuk Mahkemesi",
  "İzmir 21. Sulh Hukuk Mahkemesi",
  "İzmir 1. Tüketici Mahkemesi",
  "İzmir 2. Tüketici Mahkemesi",
  "İzmir 3. Tüketici Mahkemesi",
  "İzmir 4. Tüketici Mahkemesi",
  "İzmir 5. Tüketici Mahkemesi",
  "İzmir 6. Tüketici Mahkemesi",
  "İzmir 7. Tüketici Mahkemesi",
  "İzmir 8. Tüketici Mahkemesi",
  "İzmir 9. Tüketici Mahkemesi",
  "İzmir 10. Tüketici Mahkemesi",
  "İzmir 1. İş Mahkemesi",
  "İzmir 2. İş Mahkemesi",
  "İzmir 3. İş Mahkemesi",
  "İzmir 4. İş Mahkemesi",
  "İzmir 5. İş Mahkemesi",
  "İzmir 6. İş Mahkemesi",
  "İzmir 7. İş Mahkemesi",
  "İzmir 8. İş Mahkemesi",
  "İzmir 9. İş Mahkemesi",
  "İzmir 10. İş Mahkemesi",
  "İzmir 11. İş Mahkemesi",
  "İzmir 12. İş Mahkemesi",
  "İzmir 13. İş Mahkemesi",
  "İzmir 14. İş Mahkemesi",
  "İzmir 15. İş Mahkemesi",
  "İzmir 16. İş Mahkemesi",
  "İzmir 17. İş Mahkemesi",
  "İzmir 18. İş Mahkemesi",
  "İzmir 19. İş Mahkemesi",
  "İzmir 20. İş Mahkemesi",
  "İzmir 21. İş Mahkemesi",
  "İzmir 22. İş Mahkemesi",
  "İzmir 23. İş Mahkemesi",
  "İzmir 1. Aile Mahkemesi",
  "İzmir 2. Aile Mahkemesi",
  "İzmir 3. Aile Mahkemesi",
  "İzmir 4. Aile Mahkemesi",
  "İzmir 5. Aile Mahkemesi",
  "İzmir 6. Aile Mahkemesi",
  "İzmir 7. Aile Mahkemesi",
  "İzmir 8. Aile Mahkemesi",
  "İzmir 9. Aile Mahkemesi",
  "İzmir 10. Aile Mahkemesi",
  "İzmir 11. Aile Mahkemesi",
  "İzmir 12. Aile Mahkemesi",
  "İzmir 13. Aile Mahkemesi",
  "İzmir 14. Aile Mahkemesi",
  "İzmir 15. Aile Mahkemesi",
  "İzmir 16. Aile Mahkemesi",
  "İzmir 17. Aile Mahkemesi",
  "İzmir 18. Aile Mahkemesi",
  "İzmir 19. Aile Mahkemesi",
  "İzmir 20. Aile Mahkemesi",
  "İzmir 21. Aile Mahkemesi",
  "İzmir 22. Aile Mahkemesi",
  // ── KARŞIYAKA MAHKEMELERİ ──
  "Karşıyaka 1. Ağır Ceza Mahkemesi",
  "Karşıyaka 2. Ağır Ceza Mahkemesi",
  "Karşıyaka 3. Ağır Ceza Mahkemesi",
  "Karşıyaka 4. Ağır Ceza Mahkemesi",
  "Karşıyaka 1. Asliye Ceza Mahkemesi",
  "Karşıyaka 2. Asliye Ceza Mahkemesi",
  "Karşıyaka 3. Asliye Ceza Mahkemesi",
  "Karşıyaka 4. Asliye Ceza Mahkemesi",
  "Karşıyaka 5. Asliye Ceza Mahkemesi",
  "Karşıyaka 6. Asliye Ceza Mahkemesi",
  "Karşıyaka 7. Asliye Ceza Mahkemesi",
  "Karşıyaka 8. Asliye Ceza Mahkemesi",
  "Karşıyaka 9. Asliye Ceza Mahkemesi",
  "Karşıyaka 10. Asliye Ceza Mahkemesi",
  "Karşıyaka 11. Asliye Ceza Mahkemesi",
  "Karşıyaka 12. Asliye Ceza Mahkemesi",
  "Karşıyaka Çocuk Mahkemesi",
  "Karşıyaka 1. İcra Hukuk Mahkemesi",
  "Karşıyaka 2. İcra Hukuk Mahkemesi",
  "Karşıyaka 1. İcra Müdürlüğü",
  "Karşıyaka 2. İcra Müdürlüğü",
  "Karşıyaka 3. İcra Müdürlüğü",
  "Karşıyaka 4. İcra Müdürlüğü",
  "Karşıyaka 1. İş Mahkemesi",
  "Karşıyaka 2. İş Mahkemesi",
  "Karşıyaka 3. İş Mahkemesi",
  "Karşıyaka 4. İş Mahkemesi",
  "Karşıyaka 1. Sulh Ceza Hâkimliği",
  "Karşıyaka 2. Sulh Ceza Hâkimliği",
  "Karşıyaka 1. İnfaz Hâkimliği",
  "Karşıyaka 2. İnfaz Hâkimliği",
  "Karşıyaka 1. Asliye Hukuk Mahkemesi",
  "Karşıyaka 2. Asliye Hukuk Mahkemesi",
  "Karşıyaka 3. Asliye Hukuk Mahkemesi",
  "Karşıyaka 4. Asliye Hukuk Mahkemesi",
  "Karşıyaka 1. Sulh Hukuk Mahkemesi",
  "Karşıyaka 2. Sulh Hukuk Mahkemesi",
  "Karşıyaka 3. Sulh Hukuk Mahkemesi",
  "Karşıyaka 4. Sulh Hukuk Mahkemesi",
  "Karşıyaka 5. Sulh Hukuk Mahkemesi",
  "Karşıyaka 6. Sulh Hukuk Mahkemesi",
  "Karşıyaka 7. Sulh Hukuk Mahkemesi",
  "Karşıyaka 1. Aile Mahkemesi",
  "Karşıyaka 2. Aile Mahkemesi",
  "Karşıyaka 3. Aile Mahkemesi",
  "Karşıyaka 4. Aile Mahkemesi",
  "Karşıyaka 5. Aile Mahkemesi",
  "Karşıyaka 6. Aile Mahkemesi",
  // ── İZMİR SULH CEZA / İNFAZ ──
  "İzmir 1. Sulh Ceza Hâkimliği",
  "İzmir 2. Sulh Ceza Hâkimliği",
  "İzmir 3. Sulh Ceza Hâkimliği",
  "İzmir 4. Sulh Ceza Hâkimliği",
  "İzmir 5. Sulh Ceza Hâkimliği",
  "İzmir 6. Sulh Ceza Hâkimliği",
  "İzmir 7. Sulh Ceza Hâkimliği",
  "İzmir 1. İnfaz Hâkimliği",
  "İzmir 2. İnfaz Hâkimliği",
  "İzmir 3. İnfaz Hâkimliği",
  "İzmir 4. İnfaz Hâkimliği",
  "İzmir 5. İnfaz Hâkimliği",
  "İzmir 6. İnfaz Hâkimliği",
  "İzmir 7. İnfaz Hâkimliği",
  // ── İZMİR DİĞER ──
  "İzmir Cumhuriyet Başsavcılığı",
  "İzmir Bölge Adliye Mahkemesi",
  "İzmir İdare Mahkemesi","İzmir Vergi Mahkemesi",
  // ── ÜST MAHKEMELER ──
  "Yargıtay","Danıştay","Anayasa Mahkemesi",
  "Bursa Bölge Adliye Mahkemesi","Bursa Bölge İdare Mahkemesi",
  "İzmir Bölge İdare Mahkemesi",
  // ── DİĞER KURUMLAR ──
  "Balıkesir Emniyet Müdürlüğü","Balıkesir Jandarma Komutanlığı",
  "Balıkesir Vergi Dairesi Başkanlığı","Balıkesir SGK İl Müdürlüğü",
  "Balıkesir Tapu Müdürlüğü","Balıkesir Belediyesi",
];
const IS_TIPLERI=['Adli Kontrol Kararına İtiraz','AİHM Başvurusu','Ara Karara İtiraz','Arabuluculuk Başvurusu','Arabuluculuk Tutanağının Sunulması','AYM Bireysel Başvuru','Basit Yargılama Usulüne İtiraz','Beyan Dilekçesi','Bilirkişi Raporuna İtiraz','Bilirkişi Raporuna Karşı Beyan','Cevap Dilekçesi','Cevaba Cevap Dilekçesi','Dahili Dava Dilekçesi','Değişik İş Kararına İtiraz','Delil Listesi Sunumu','Delil Sunumu','Dosyanın Kesinleşmesi','Dosyanın Yenilenmesi İşlemi','E-Duruşma Talebi','Ek Karar Talebi (Hükmün Tamamlanması)','Esas Hakkında Beyan','Gerekçeli Karar Yazıldı mı?','Hukuk Dava Açılış','İcra Dosyası Ödeme','İcra İşlemini Şikayet','İcranın Kesinleşmesi','İdari Dava Açılış','İdari Para Cezasına İtiraz','İhtarnameye Cevap','İhtiyati Hacze İtiraz','İhtiyati Tedbire İtiraz Dilekçesi','İkinci Cevap Dilekçesi','İlamsız İcraya İtiraz','İstinaf Başvuru Dilekçesi','İstinaf Başvurusuna Cevap','Islah Dilekçesi','Islaha Karşı Beyan Dilekçesi','Kambiyo Takibine İtiraz','Kanun Yararına Bozma Başvurusu','Maaş Haczi İtirazı','Nihai Karara İtiraz Dilekçesi','Savunma Dilekçesi','Savunmaya Cevap Dilekçesi','Süre Uzatım','Takipsizlik (KYOK) Kararına İtiraz','Tanık Beyanlarına Karşı Beyan','Tanık Bildirimi','Tehiri İcra Kararı Sunumu','Temyiz Başvuru Dilekçesi','Temyiz Başvurusuna Cevap','Tensip Kaynaklı İşlemler','Tutukluluğa İtiraz','YD İtiraz Dilekçesi'].sort((a,b)=>a.localeCompare(b,'tr'));

// ── ADLİ TATİLE TABİ OLMAYAN İŞ TİPLERİ ────────────────────────────
// Bu iş tipleri seçildiğinde, süre son günü adli tatile denk gelse bile
// ötelenmez (adli tatilde de görülmeye/işlemeye devam eden işler).
const ADLI_TATIL_MUAF_ISTIPLERI=new Set([
  'İhtiyati Tedbire İtiraz Dilekçesi',
  'İhtiyati Hacze İtiraz',
  'Değişik İş Kararına İtiraz',
  'Tutukluluğa İtiraz',
  'Adli Kontrol Kararına İtiraz',
  'Delil Sunumu',
  'Delil Listesi Sunumu',
  'AYM Bireysel Başvuru',
  'AYM Bakanlık Görüşüne İtiraz',
  'AİHM Başvurusu',
  'AİHM Bakanlık Görüşüne İtiraz',
]);

let selectedIstipi='';
let records=[],ST={type:'sure',teblig:'',dal:'',dal2:'',birim:'',hesaplananTarih:null,hesapDetay:null,editId:null,prefillDate:''};
let currentMonth=new Date().getMonth(),currentYear=new Date().getFullYear(),openDetailId=null;
let calendarView='month',calendarCursor=new Date();

// ── İŞ TİPİ ──────────────────────────────────────────────────────
function renderIstipiList(filter=''){
  const list=document.getElementById('istipi-list');
  const all=tumIstipiListesi();
  const tam=(filter||'').trim();
  const filtered=tam?all.filter(x=>x.toLowerCase().includes(tam.toLowerCase())):all;
  let html=filtered.map(x=>`<div class="istipi-item${selectedIstipi===x?' sel':''}" onclick="selectIstipi('${x.replace(/'/g,"\\'")}')">${x}</div>`).join('');
  if(tam&&!all.some(x=>x.toLowerCase()===tam.toLowerCase())){
    html+=`<div class="istipi-item istipi-ekle" onclick="yeniIstipiEkleSureli('${tam.replace(/'/g,"\\'")}')">➕ "${tam}" olarak yeni iş tipi ekle</div>`;
  }
  list.innerHTML=html||'<div class="istipi-item" style="color:var(--text3);">Sonuç yok</div>';
}
function filterIstipi(val){renderIstipiList(val);document.getElementById('istipi-list').style.display='block';}
function showIstipiList(){renderIstipiList(document.getElementById('istipi-search').value);document.getElementById('istipi-list').style.display='block';}
function selectIstipi(val){selectedIstipi=val;document.getElementById('istipi-search').value=val;document.getElementById('f-istipi-val').value=val;document.getElementById('f-istipi-text').value=val;document.getElementById('istipi-list').style.display='none';hesapla();}
document.addEventListener('click',e=>{if(!e.target.closest('.istipi-wrap')&&!e.target.closest('.istipi-search')){const l=document.getElementById('istipi-list');if(l)l.style.display='none';}});
// ── GENEL İŞ İÇİN İŞ TİPİ HIZLI SEÇİCİ ─────────────────────────────
function renderIstipiListGenel(filter=''){
  const list=document.getElementById('istipi-list-genel');
  if(!list)return;
  const all=tumIstipiListesi();
  const tam=(filter||'').trim();
  const filtered=tam?all.filter(x=>x.toLowerCase().includes(tam.toLowerCase())):all;
  let html=filtered.map(x=>`<div class="istipi-item" onclick="selectIstipiGenel('${x.replace(/'/g,"\\'")}')">${x}</div>`).join('');
  if(tam&&!all.some(x=>x.toLowerCase()===tam.toLowerCase())){
    html+=`<div class="istipi-item istipi-ekle" onclick="yeniIstipiEkleGenel('${tam.replace(/'/g,"\\'")}')">➕ "${tam}" olarak yeni iş tipi ekle</div>`;
  }
  list.innerHTML=html||'<div class="istipi-item" style="color:var(--text3);">Sonuç yok</div>';
}
function filterIstipiGenel(val){renderIstipiListGenel(val);document.getElementById('istipi-list-genel').style.display='block';}
function showIstipiListGenel(){renderIstipiListGenel(document.getElementById('istipi-search-genel').value);document.getElementById('istipi-list-genel').style.display='block';}
function selectIstipiGenel(val){document.getElementById('istipi-search-genel').value=val;document.getElementById('f-genel-baslik').value=val;document.getElementById('istipi-list-genel').style.display='none';}
document.addEventListener('click',e=>{if(!e.target.closest('.istipi-wrap-genel')&&!e.target.closest('.istipi-search-genel')){const l=document.getElementById('istipi-list-genel');if(l)l.style.display='none';}});

// ── YIL ───────────────────────────────────────────────────────────
function renderDrum(id){
  const val=parseInt(document.getElementById(id).value);
  const inner=document.getElementById(id+'-drum-inner');
  if(!inner)return;
  inner.innerHTML=[val-1,val,val+1].map((y,i)=>`<div class="yil-drum-item">${y}</div>`).join('');
  inner.style.transform='translateY(-44px)';
}
function changeYil(id,dir){
  const h=document.getElementById(id);
  const v=parseInt(h.value)+dir;
  h.value=v;
  renderDrum(id);
}
function setYil(id,val){
  const h=document.getElementById(id);
  if(h)h.value=String(val);
}
let _drumState={};
function drumStart(e,id){
  e.preventDefault();
  const startY=e.touches?e.touches[0].clientY:e.clientY;
  _drumState[id]={startY,startVal:parseInt(document.getElementById(id).value)};
  const move=ev=>{
    const y=ev.touches?ev.touches[0].clientY:ev.clientY;
    const diff=Math.round((startY-y)/44);
    if(diff!==0){
      document.getElementById(id).value=_drumState[id].startVal+diff;
      renderDrum(id);
    }
  };
  const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);};
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',up);
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',up);
}
function drumWheel(e,id){
  e.preventDefault();
  const dir=e.deltaY>0?1:-1;
  changeYil(id,dir);
}

// ── VERİ ──────────────────────────────────────────────────────────

// ── BİLDİRİMLER ──────────────────────────────────────────────────
