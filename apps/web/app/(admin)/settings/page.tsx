import { getSystemSettings } from '../../../lib/settings/service';
import { updateSystemSettings } from '../../actions/settings';

export default async function AdminSettingsPage() {
    const settings = await getSystemSettings();

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-2">System Settings & Configuration</h1>
            <p className="text-gray-600 mb-8 pb-4 border-b">
                Manage platform-wide configuration. Changes are logged and cached instantly.
            </p>

            {settings ? (
                <form action={updateSystemSettings} className="space-y-8 bg-white p-6 shadow-sm rounded-lg border">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Platform Fee Percentage (%)</label>
                            <input
                                type="number"
                                name="fee_percentage"
                                step="0.01"
                                min="0"
                                max="100"
                                defaultValue={settings.fee_percentage}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                            <p className="text-xs text-gray-500">The global percentage cut for all executed transactions.</p>
                        </div>

                        <div className="space-y-2 flex flex-col justify-center">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="verification_required"
                                    defaultChecked={settings.verification_required}
                                    className="w-5 h-5 accent-blue-600"
                                />
                                <span className="text-sm font-semibold text-gray-700">Strict KYC Verification Required</span>
                            </label>
                            <p className="text-xs text-gray-500 ml-8">Enforces strict identity checks for listings and escrows.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Suspension Rules (JSON)</label>
                        <textarea
                            name="suspension_rules"
                            rows={4}
                            defaultValue={JSON.stringify(settings.suspension_rules, null, 2)}
                            className="w-full border p-3 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Feature Flags Overrides (JSON)</label>
                            <textarea
                                name="feature_flags"
                                rows={5}
                                defaultValue={JSON.stringify(settings.feature_flags, null, 2)}
                                className="w-full border p-3 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Email Templates Schema (JSON)</label>
                            <textarea
                                name="email_templates"
                                rows={5}
                                defaultValue={JSON.stringify(settings.email_templates, null, 2)}
                                className="w-full border p-3 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button
                            type="submit"
                            className="bg-black text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-800 transition shadow-sm"
                        >
                            Save Configuration
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-12 text-center text-gray-500 border border-dashed rounded-lg bg-gray-50">
                    No system settings initialized. Please run the database migration.
                </div>
            )}
        </div>
    );
}
