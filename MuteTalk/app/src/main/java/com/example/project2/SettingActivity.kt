package com.example.project2

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Switch
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class SettingActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_setting)
//        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
//            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
//            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
//            insets
//        }
        var okButton = findViewById<Button>(R.id.button);
        okButton.setOnClickListener{
            var intent = Intent(this, RenderActivity::class.java)
            var text = findViewById<EditText>(R.id.editTextText)
            var textSize = findViewById<EditText>(R.id.editTextSize)
            var singleLine = findViewById<Switch>(R.id.singleLine)

            intent.putExtra("text", text.text.toString())
            var textSizeInFloat : Float = textSize.text.toString().toFloat()
            intent.putExtra("textSize", textSizeInFloat)
            intent.putExtra("singleLine", singleLine.isChecked)
            startActivity(intent)
        }
    }
}