param(
    [Parameter(Mandatory = $true)]
    [string]$ConnectionString
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$updates = @(
    @{ NodeId = 'about.node1.desc'; Scope = 'en'; Value = "Sourced from premier sun-drenched orchards around the world. We work directly with trusted growers to ensure excellence from the source." },
    @{ NodeId = 'about.node1.desc'; Scope = 'ar'; Value = 'من أفخم البساتين المشمسة حول العالم. نعمل مباشرة مع مزارعين موثوقين لضمان التميز من المصدر.' },
    @{ NodeId = 'about.node2.desc'; Scope = 'en'; Value = "Rigorous hand-picking and uncompromising quality control. Every fruit is inspected carefully to meet El Mostafa's premium standards." },
    @{ NodeId = 'about.node2.desc'; Scope = 'ar'; Value = 'قطف دقيق ورقابة صارمة على الجودة. يتم فحص كل ثمرة بعناية لتلبية معايير المصطفى الفاخرة.' },
    @{ NodeId = 'contact.title'; Scope = 'en'; Value = 'Send us a message' },
    @{ NodeId = 'contact.title'; Scope = 'ar'; Value = 'أرسل لنا رسالة' },
    @{ NodeId = 'footer.rightsPrefix'; Scope = 'en'; Value = 'EL MOSTAFA. All rights reserved. Designed and developed by' },
    @{ NodeId = 'footer.rightsPrefix'; Scope = 'ar'; Value = 'المصطفى. جميع الحقوق محفوظة. التصميم والتطوير بواسطة' },
    @{ NodeId = 'footer.terms'; Scope = 'en'; Value = 'Terms & Conditions' },
    @{ NodeId = 'footer.terms'; Scope = 'ar'; Value = 'الشروط والأحكام' },
    @{ NodeId = 'hero.eyebrow'; Scope = 'ar'; Value = 'مستوردو الفواكه الفاخرة' },
    @{ NodeId = 'hero.subtitle'; Scope = 'ar'; Value = 'المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. من مصادر عالمية وتصل إليك طازجة.' },
    @{ NodeId = 'insights.milestonesTitle'; Scope = 'en'; Value = 'Growth timeline' },
    @{ NodeId = 'insights.milestonesTitle'; Scope = 'ar'; Value = 'الخط الزمني للنمو' },
    @{ NodeId = 'navbar.quote'; Scope = 'ar'; Value = 'اطلب عرض سعر' },
    @{ NodeId = 'navbar.quote'; Scope = 'global'; Value = 'Quote' },
    @{ NodeId = 'newsletter.error'; Scope = 'en'; Value = 'Could not complete the subscription.' },
    @{ NodeId = 'newsletter.error'; Scope = 'ar'; Value = 'تعذر إتمام الاشتراك.' },
    @{ NodeId = 'newsletter.title'; Scope = 'en'; Value = 'Stay updated on fresh arrivals' },
    @{ NodeId = 'newsletter.title'; Scope = 'ar'; Value = 'تابع أحدث الواردات الطازجة' },
    @{ NodeId = 'products.subtitle'; Scope = 'en'; Value = 'Explore our curated selection of premium imported fruits from around the world.' },
    @{ NodeId = 'products.subtitle'; Scope = 'ar'; Value = 'استكشف تشكيلتنا المختارة بعناية من أجود الفواكه المستوردة من مختلف أنحاء العالم.' },
    @{ NodeId = 'whyUs.subtitle'; Scope = 'en'; Value = 'Excellence in every bite. Quality in every detail. We go beyond simple importing to deliver an unmatched standard of freshness and taste.' },
    @{ NodeId = 'whyUs.subtitle'; Scope = 'ar'; Value = 'التميّز في كل ثمرة، والجودة في كل تفصيلة. نتجاوز مجرد الاستيراد لنقدّم مستوى لا يُضاهى من الطزاجة والطعم.' }
)

$connection = [System.Data.SqlClient.SqlConnection]::new($ConnectionString)
$connection.Open()
$transaction = $connection.BeginTransaction()

try {
    $idTypeCommand = $connection.CreateCommand()
    $idTypeCommand.Transaction = $transaction
    $idTypeCommand.CommandText = @"
SELECT DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'cms_content_entries'
  AND COLUMN_NAME = 'Id'
"@
    $entryIdType = [string]$idTypeCommand.ExecuteScalar()

    if ($entryIdType -eq 'uniqueidentifier') {
        $insertStatement = @"
    INSERT INTO cms_content_entries (Id, node_id, type, scope, draft_value, published_value, updated_at, published_at)
    VALUES (
        NEWID(),
        @node_id,
        COALESCE((SELECT TOP 1 type FROM cms_content_entries WHERE node_id = @node_id), 'text'),
        @scope,
        @value,
        @value,
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );
"@
    }
    else {
        $insertStatement = @"
    INSERT INTO cms_content_entries (node_id, type, scope, draft_value, published_value, updated_at, published_at)
    VALUES (
        @node_id,
        COALESCE((SELECT TOP 1 type FROM cms_content_entries WHERE node_id = @node_id), 'text'),
        @scope,
        @value,
        @value,
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );
"@
    }

    foreach ($update in $updates) {
        $command = $connection.CreateCommand()
        $command.Transaction = $transaction
        $command.CommandText = @"
IF EXISTS (SELECT 1 FROM cms_content_entries WHERE node_id = @node_id AND scope = @scope)
BEGIN
    UPDATE cms_content_entries
    SET draft_value = @value,
        published_value = @value,
        updated_at = SYSDATETIMEOFFSET(),
        published_at = COALESCE(published_at, SYSDATETIMEOFFSET())
    WHERE node_id = @node_id
      AND scope = @scope;
END
ELSE
BEGIN
$insertStatement
END
"@
        [void]$command.Parameters.Add('@node_id', [System.Data.SqlDbType]::NVarChar, 255)
        [void]$command.Parameters.Add('@scope', [System.Data.SqlDbType]::NVarChar, 10)
        [void]$command.Parameters.Add('@value', [System.Data.SqlDbType]::NVarChar, -1)
        $command.Parameters['@node_id'].Value = $update.NodeId
        $command.Parameters['@scope'].Value = $update.Scope
        $command.Parameters['@value'].Value = $update.Value
        [void]$command.ExecuteNonQuery()
    }

    $siteContent = $connection.CreateCommand()
    $siteContent.Transaction = $transaction
    $siteContent.CommandText = @"
IF EXISTS (SELECT 1 FROM site_content WHERE id = 1)
BEGIN
    DECLARE @cfg nvarchar(max) = (SELECT configuration FROM site_content WHERE id = 1);
    SET @cfg = JSON_MODIFY(@cfg, '$.hero.eyebrow.ar', @hero_eyebrow_ar);
    SET @cfg = JSON_MODIFY(@cfg, '$.hero.subtitle.ar', @hero_subtitle_ar);

    UPDATE site_content
    SET configuration = @cfg,
        updated_at = SYSDATETIMEOFFSET()
    WHERE id = 1;
END
"@
    [void]$siteContent.Parameters.Add('@hero_eyebrow_ar', [System.Data.SqlDbType]::NVarChar, -1)
    [void]$siteContent.Parameters.Add('@hero_subtitle_ar', [System.Data.SqlDbType]::NVarChar, -1)
    $siteContent.Parameters['@hero_eyebrow_ar'].Value = 'مستوردو الفواكه الفاخرة'
    $siteContent.Parameters['@hero_subtitle_ar'].Value = 'المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. من مصادر عالمية وتصل إليك طازجة.'
    [void]$siteContent.ExecuteNonQuery()

    $transaction.Commit()
}
catch {
    try {
        $transaction.Rollback()
    }
    catch {
    }
    throw
}
finally {
    $connection.Dispose()
}
