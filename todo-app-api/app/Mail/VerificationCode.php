<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class VerificationCode extends Mailable
{
    public function __construct(public readonly string $code) {}

    public function build()
    {
        return $this->subject('Verify your Eves email')->text('emails.verification')->with(['code' => $this->code]);
    }
}
